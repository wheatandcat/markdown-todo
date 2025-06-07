import { useTasks } from "@/hooks/use-tasks";
import { useTimers } from "@/hooks/use-timers";
import { Card } from "@/components/ui/card";
import { BarChart3, CheckCircle, Clock, List } from "lucide-react";

export function StatsView() {
  const { activeTasks, completedTasks } = useTasks();
  const { timerTasks } = useTimers();

  const activeCount = activeTasks.data?.length || 0;
  const completedCount = completedTasks.data?.length || 0;
  const timerCount = timerTasks.data?.length || 0;
  const totalTasks = activeCount + completedCount;
  const completionRate = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

  const stats = [
    {
      title: "アクティブなタスク",
      value: activeCount,
      icon: List,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    {
      title: "完了済みタスク",
      value: completedCount,
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-800",
    },
    {
      title: "実行中のタイマー",
      value: timerCount,
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
      borderColor: "border-amber-200 dark:border-amber-800",
    },
    {
      title: "総タスク数",
      value: totalTasks,
      icon: BarChart3,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      borderColor: "border-purple-200 dark:border-purple-800",
    },
  ];

  if (activeTasks.isLoading || completedTasks.isLoading || timerTasks.isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          統計情報
        </h2>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.title}
                className={`p-6 ${stat.bgColor} ${stat.borderColor}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {stat.title}
                    </p>
                    <p className={`text-3xl font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </Card>
            );
          })}
        </div>

        {/* Completion Rate */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            完了率
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">
                全体の進捗
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {completionRate.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-green-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>{completedCount} 完了</span>
              <span>{activeCount} 残り</span>
            </div>
          </div>
        </Card>

        {/* Quick Summary */}
        {totalTasks > 0 && (
          <Card className="p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              概要
            </h3>
            <div className="space-y-2 text-gray-600 dark:text-gray-300">
              <p>
                現在 <strong>{activeCount}</strong> 個のアクティブなタスクがあります。
              </p>
              <p>
                これまでに <strong>{completedCount}</strong> 個のタスクを完了しました。
              </p>
              {timerCount > 0 && (
                <p>
                  <strong>{timerCount}</strong> 個のタスクでタイマーが実行中です。
                </p>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}