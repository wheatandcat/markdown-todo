import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

// Allow running without Replit auth for local development
const hasReplitAuth = process.env.REPLIT_DOMAINS && process.env.REPL_ID;

const getOidcConfig = memoize(
  async () => {
    if (!hasReplitAuth) {
      return null;
    }
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  // Tauri環境での特別なCookie設定
  const isTauriEnv = process.env.TAURI_ENV === "true";
  const isDev = process.env.NODE_ENV === "development";
  
  return session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-for-development',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: false, // Tauriでは常にfalse
      secure: false, // HTTP通信のためfalse
      sameSite: 'lax', // Tauriでは'lax'が安全
      maxAge: sessionTtl,
      path: '/',
      domain: isTauriEnv ? 'localhost' : undefined, // Tauriでは明示的にlocalhostを指定
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  // Only setup Replit auth if environment variables are available
  if (hasReplitAuth) {
    const config = await getOidcConfig();
    if (config) {
      const verify: VerifyFunction = async (
        tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
        verified: passport.AuthenticateCallback
      ) => {
        const user = {};
        updateUserSession(user, tokens);
        await upsertUser(tokens.claims());
        verified(null, user);
      };

      for (const domain of process.env
        .REPLIT_DOMAINS!.split(",")) {
        const strategy = new Strategy(
          {
            name: `replitauth:${domain}`,
            config,
            scope: "openid email profile offline_access",
            callbackURL: `https://${domain}/api/callback`,
          },
          verify,
        );
        passport.use(strategy);
      }

      app.get("/api/login", (req, res, next) => {
        passport.authenticate(`replitauth:${req.hostname}`, {
          prompt: "login consent",
          scope: ["openid", "email", "profile", "offline_access"],
        })(req, res, next);
      });

      app.get("/api/callback", (req, res, next) => {
        passport.authenticate(`replitauth:${req.hostname}`, {
          successReturnToOrRedirect: "/",
          failureRedirect: "/api/login",
        })(req, res, next);
      });

      app.get("/api/logout", (req, res) => {
        req.logout(() => {
          res.redirect(
            client.buildEndSessionUrl(config, {
              client_id: process.env.REPL_ID!,
              post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
            }).href
          );
        });
      });
    }
  } else {
    // Fallback routes for local development without Replit
    app.get("/api/login", (req, res) => {
      res.redirect("/login");
    });

    app.get("/api/logout", (req, res) => {
      req.logout(() => {
        res.redirect("/");
      });
    });
  }
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  console.log("isAuthenticated check:", {
    isAuthenticated: req.isAuthenticated(),
    user: user ? { id: user.id, isLocal: user.isLocal } : null,
    sessionID: req.sessionID
  });

  if (!req.isAuthenticated()) {
    console.log("Authentication failed: req.isAuthenticated() returned false");
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Handle local auth users
  if (user.isLocal) {
    console.log("Local auth user authenticated:", user.id);
    return next();
  }

  // Handle Replit auth users
  if (!user.expires_at) {
    console.log("Replit auth user missing expires_at");
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    console.log("Replit auth user valid token");
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    console.log("Replit auth user missing refresh token");
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    console.log("Replit auth user token refreshed");
    return next();
  } catch (error) {
    console.log("Replit auth token refresh failed:", error);
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};