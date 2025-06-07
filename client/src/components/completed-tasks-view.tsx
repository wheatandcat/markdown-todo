import { useTasks } from "@/hooks/use-tasks";
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export function CompletedTasksView() {
  const { completedTasks } = useTasks();

  if (completedTasks.isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!completedTasks.data || completedTasks.data.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            完了済みタスクがありません
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            タスクを完了すると、ここに表示されます。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          完了済みタスク
        </h2>
        <div className="space-y-4">
          {completedTasks.data.map((task) => (
            <Card key={task.id} className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="flex-1 text-gray-900 dark:text-gray-100">
                  {task.text}
                </span>
                {task.completedAt && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(task.completedAt).toLocaleString('ja-JP', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}