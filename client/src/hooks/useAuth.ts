import { useQuery } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";

export function useAuth() {
  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: 0, // ログアウト後すぐに状態を更新
    refetchOnWindowFocus: true, // フォーカス時に再検証
  });

  const logout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
    } catch (error) {
      console.error("Logout API error:", error);
    }
    
    // クエリキャッシュをクリア
    await queryClient.clear();
    
    // 認証クエリを明示的に無効化し、再取得
    await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    
    // 強制的に認証状態を再取得
    await refetch();
    
    // ストレージもクリア
    sessionStorage.clear();
    localStorage.removeItem("markdownContent");
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
  };
}