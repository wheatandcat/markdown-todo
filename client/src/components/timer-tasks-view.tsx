import { useTimers } from "@/hooks/use-timers";
import { useTasks } from "@/hooks/use-tasks";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, Timer, CheckCircle } from "lucide-react";

export function TimerTasksView() {
  const { timerTasks, getTimerProgress, getRemainingTime } = useTimers();
  const { updateTask } = useTasks();

  const formatTime = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleCompleteTask = async (taskId: number) => {
    await updateTask.mutateAsync({
      id: taskId,
      completedAt: Date.now(),
    });
  };

  if (timerTasks.isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!timerTasks.data || timerTasks.data.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <Timer className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            実行中のタイマーがありません
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            タスクをチェックすると1時間のタイマーが開始されます。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-3 md:p-6 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 md:mb-6">
          実行中のタイマー
        </h2>
        <div className="space-y-4">
          {timerTasks.data.map((task) => {
            const progress = getTimerProgress(task.id) || 0;
            const remaining = getRemainingTime(task.id) || 0;
            
            return (
              <Card key={task.id} className="p-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    <span className="flex-1 text-gray-900 dark:text-gray-100">
                      {task.text}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-mono text-amber-700 dark:text-amber-300">
                        残り {formatTime(remaining)}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCompleteTask(task.id)}
                        disabled={updateTask.isPending}
                        className="h-7 px-2 text-xs bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        完了
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Progress 
                      value={progress} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>開始</span>
                      <span>{progress.toFixed(0)}%</span>
                      <span>完了</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}