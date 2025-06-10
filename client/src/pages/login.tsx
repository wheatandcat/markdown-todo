import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { loginSchema, type LoginData } from "@shared/schema";
import { Link, useLocation } from "wouter";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // 既にログイン済みの場合はホームページにリダイレクト
  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginData) => {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/local-login", data);
      
      // キャッシュを無効化して認証状態を再取得
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      // Tauriでは認証状態を確実に確認してから遷移
      let retryCount = 0;
      const maxRetries = 5;
      
      const checkAuthAndRedirect = async () => {
        try {
          const user = await queryClient.fetchQuery({
            queryKey: ["/api/auth/user"],
            retry: false,
          });
          
          if (user) {
            toast({
              title: "ログイン成功",
              description: "タスク管理画面に移動します...",
            });
            
            setTimeout(() => {
              setLocation("/");
            }, 100);
          } else if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(checkAuthAndRedirect, 200);
          } else {
            throw new Error("認証状態の確認に失敗しました");
          }
        } catch (error) {
          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(checkAuthAndRedirect, 200);
          } else {
            throw error;
          }
        }
      };
      
      await checkAuthAndRedirect();
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "ログインエラー",
        description: "メールアドレスまたはパスワードが正しくありません",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">ログイン</CardTitle>
          <CardDescription>
            アカウントにログインしてタスク管理を始めましょう
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>メールアドレス</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your-email@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>パスワード</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="パスワードを入力"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "ログイン中..." : "ログイン"}
              </Button>
            </form>
          </Form>

          <div className="text-center space-y-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              アカウントをお持ちでない方は{" "}
              <Link href="/register" className="text-blue-600 hover:underline">
                新規登録
              </Link>
            </p>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-800 px-2 text-slate-500">
                  または
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.href = '/api/login'}
            >
              Replit アカウントでログイン
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}