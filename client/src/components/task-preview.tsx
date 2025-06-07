import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, Clock } from "lucide-react";
import { parseMarkdownTasks } from "@/lib/markdown-parser";
import { useTasks } from "@/hooks/use-tasks";
import { useTimers } from "@/hooks/use-timers";
import type { Task } from "@shared/schema";

interface TaskPreviewProps {
  content: string;
}

export function TaskPreview({ content }: TaskPreviewProps) {
  const [parsedContent, setParsedContent] = useState<any[]>([]);
  const { activeTasks, completedTasks, updateTask } = useTasks();
  const { getTimerProgress } = useTimers();

  useEffect(() => {
    const parsed = parseMarkdownTasks(content);
    setParsedContent(parsed);
  }, [content]);

  const findTaskByText = (text: string): Task | undefined => {
    const allTasks = [...(activeTasks.data || []), ...(completedTasks.data || [])];
    return allTasks.find(task => task.text === text);
  };

  const handleTaskToggle = async (taskText: string, checked: boolean) => {
    const existingTask = findTaskByText(taskText);
    
    if (existingTask) {
      // Update existing task
      await updateTask.mutateAsync({
        id: existingTask.id,
        completed: checked,
        checkedAt: checked ? Date.now() : null,
      });
    }
  };

  const refreshPreview = () => {
    const parsed = parseMarkdownTasks(content);
    setParsedContent(parsed);
  };

  const renderContent = (item: any) => {
    if (item.type === "heading") {
      const HeadingTag = `h${item.level}` as keyof JSX.IntrinsicElements;
      return (
        <HeadingTag
          key={item.id}
          className={`font-semibold mb-4 ${
            item.level === 1
              ? "text-2xl"
              : item.level === 2
              ? "text-xl"
              : "text-lg"
          }`}
        >
          {item.text}
        </HeadingTag>
      );
    }

    if (item.type === "task") {
      const existingTask = findTaskByText(item.text);
      const actualCompleted = existingTask ? existingTask.completed : item.completed;
      const timerProgress = existingTask ? getTimerProgress(existingTask.id) : null;
      const hasTimer = actualCompleted && timerProgress !== null;

      return (
        <Card
          key={item.id}
          className={`task-item mb-3 p-3 shadow-sm transition-all hover:shadow-md ${
            hasTimer
              ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
              : actualCompleted
              ? "task-completed"
              : ""
          }`}
        >
          <label className="flex items-start space-x-3 cursor-pointer">
            <Checkbox
              checked={actualCompleted}
              onCheckedChange={(checked) =>
                handleTaskToggle(item.text, checked as boolean)
              }
              className="mt-0.5"
            />
            <div className="flex-1">
              <span
                className={`text-sm ${
                  actualCompleted ? "line-through text-muted-foreground" : ""
                }`}
              >
                {item.text}
              </span>
              {hasTimer && (
                <div className="mt-2 flex items-center space-x-2">
                  <div className="flex-1">
                    <Progress
                      value={timerProgress}
                      className="h-1.5 bg-amber-200 dark:bg-amber-800"
                    />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {Math.ceil(60 - (timerProgress || 0) * 0.6)}分後に完了
                  </Badge>
                </div>
              )}
            </div>
          </label>
        </Card>
      );
    }

    if (item.type === "paragraph") {
      return (
        <p key={item.id} className="text-muted-foreground mb-2">
          {item.text}
        </p>
      );
    }

    return null;
  };

  const taskCount = parsedContent.filter((item) => item.type === "task").length;

  return (
    <div className="w-1/2 flex flex-col border-l border-border">
      <div className="flex items-center justify-between px-6 py-3 bg-muted border-b border-border">
        <h3 className="text-sm font-medium text-muted-foreground">プレビュー</h3>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-xs">
            タスク: {taskCount}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={refreshPreview}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="markdown-content space-y-2">
          {parsedContent.map(renderContent)}
        </div>
      </div>
    </div>
  );
}
