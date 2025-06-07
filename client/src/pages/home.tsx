import { useState, useRef } from "react";
import { Sidebar } from "@/components/sidebar";
import { MarkdownEditor } from "@/components/markdown-editor";
import { TaskPreview } from "@/components/task-preview";
import { QuickAddModal } from "@/components/quick-add-modal";
import { CompletedTasksView } from "@/components/completed-tasks-view";
import { TimerTasksView } from "@/components/timer-tasks-view";
import { StatsView } from "@/components/stats-view";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTasks } from "@/hooks/use-tasks";
import { useAuth } from "@/hooks/useAuth";
import { Menu, Plus, Save, Download, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Home() {
  const [markdownContent, setMarkdownContent] = useState(`## 今日のタスク

- [ ] プロジェクトの設計書を作成する
- [ ] Tauri 2.0の新機能を調査する  
- [ ] コードレビューを完了する
- [ ] ドキュメントを更新する

## 明日の予定

- [ ] 新機能のテストを実行する
- [ ] バグ修正を行う

## メモ

Markdownのチェックボックス記法を使ってタスクを作成できます。
チェックすると1時間後に自動で完了扱いになります。`);

  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  const { toast } = useToast();
  const { user } = useAuth();
  const { syncMarkdownTasks } = useTasks();
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  const handleSave = () => {
    localStorage.setItem("markdownContent", markdownContent);
    toast({
      title: "保存完了",
      description: "Markdownの内容が保存されました。",
    });
  };

  const handleExport = () => {
    const blob = new Blob([markdownContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tasks-${new Date().toISOString().split("T")[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "エクスポート完了",
      description: "Markdownファイルをダウンロードしました。",
    });
  };

  const handleMarkdownChange = (content: string) => {
    setMarkdownContent(content);
    // Debounce the sync to avoid multiple API calls
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    syncTimeoutRef.current = setTimeout(() => {
      syncMarkdownTasks.mutate(content);
    }, 1000);
  };

  const insertTaskTemplate = () => {
    const template = "\n- [ ] 新しいタスク\n";
    setMarkdownContent(prev => prev + template);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden mr-4"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
              </Sheet>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Markdownエディター
              </h2>
            </div>

            <div className="flex items-center space-x-2 md:space-x-3">
              <Button variant="outline" size="sm" onClick={handleSave} className="hidden sm:flex">
                <Save className="w-4 h-4 mr-2" />
                保存
              </Button>
              <Button variant="outline" size="icon" onClick={handleSave} className="sm:hidden">
                <Save className="w-4 h-4" />
              </Button>

              <Button variant="outline" size="sm" onClick={handleExport} className="hidden sm:flex">
                <Download className="w-4 h-4 mr-2" />
                エクスポート
              </Button>
              <Button variant="outline" size="icon" onClick={handleExport} className="sm:hidden">
                <Download className="w-4 h-4" />
              </Button>

              <Button variant="outline" size="sm" onClick={handleLogout} className="hidden sm:flex">
                <LogOut className="w-4 h-4 mr-2" />
                ログアウト
              </Button>
              <Button variant="outline" size="icon" onClick={handleLogout} className="sm:hidden">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {activeTab === "active" && (
            <>
              <div className="flex-1 min-h-0 md:min-h-full">
                <MarkdownEditor
                  content={markdownContent}
                  onChange={handleMarkdownChange}
                  onInsertTemplate={insertTaskTemplate}
                />
              </div>
              <div className="flex-1 min-h-0 md:min-h-full border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700">
                <TaskPreview 
                  content={markdownContent} 
                  onMarkdownUpdate={setMarkdownContent}
                />
              </div>
            </>
          )}
          {activeTab === "completed" && (
            <div className="flex-1 min-h-0">
              <CompletedTasksView />
            </div>
          )}
          {activeTab === "timers" && (
            <div className="flex-1 min-h-0">
              <TimerTasksView />
            </div>
          )}
          {activeTab === "stats" && (
            <div className="flex-1 min-h-0">
              <StatsView />
            </div>
          )}
        </main>
      </div>

      {/* Floating Action Button */}
      <Button
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 h-12 w-12 rounded-full shadow-lg"
        onClick={() => setShowQuickAdd(true)}
      >
        <Plus className="h-5 w-5" />
      </Button>

      {/* Quick Add Modal */}
      <QuickAddModal
        open={showQuickAdd}
        onOpenChange={setShowQuickAdd}
        onAddTask={(task) => {
          const newTask = `\n- [ ] ${task}`;
          setMarkdownContent(prev => prev + newTask);
        }}
      />
    </div>
  );
}
