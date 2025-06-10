import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Tauri環境でのベースURL設定
const getBaseUrl = () => {
  // Tauriアプリかどうかを判定（複数の方法で確認）
  if (typeof window !== 'undefined') {
    // デバッグ情報を出力
    console.log('Environment detection:', {
      hasTauri: !!window.__TAURI__,
      protocol: window.location.protocol,
      userAgent: navigator.userAgent,
      href: window.location.href
    });
    
    // 1. __TAURI__オブジェクトの存在確認
    if (window.__TAURI__) {
      console.log('Using Tauri environment - API base URL: http://localhost:5001');
      return 'http://localhost:5001';
    }
    // 2. Tauriプロトコルの確認
    if (window.location.protocol === 'tauri:') {
      console.log('Using Tauri protocol - API base URL: http://localhost:5001');
      return 'http://localhost:5001';
    }
    // 3. Tauri特有のユーザーエージェント確認
    if (navigator.userAgent.includes('Tauri')) {
      console.log('Using Tauri user agent - API base URL: http://localhost:5001');
      return 'http://localhost:5001';
    }
  }
  console.log('Using web environment - API base URL: (empty)');
  return '';
};

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const baseUrl = getBaseUrl();
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  
  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const baseUrl = getBaseUrl();
    const url = queryKey[0] as string;
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
    
    const res = await fetch(fullUrl, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
