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
  onMarkdownUpdate: (content: string) => void;
}

export function TaskPreview({ content, onMarkdownUpdate }: TaskPreviewProps) {
  const [parsedContent, setParsedContent] = useState<any[]>([]);
  const [lastUserAction, setLastUserAction] = useState<number>(0);
  const { activeTasks, completedTasks, updateTask, createTask } = useTasks();
  const { getTimerProgress } = useTimers();

  useEffect(() => {
    const parsed = parseMarkdownTasks(content);
    setParsedContent(parsed);
  }, [content]);

  // Initial timer state synchronization on component mount
  useEffect(() => {
    if (activeTasks.data || completedTasks.data) {
      updateMarkdownForTimerStates();
    }
  }, [activeTasks.isSuccess, completedTasks.isSuccess]);

  // Debounced timer state synchronization - only run if no recent user interaction
  useEffect(() => {
    const timeSinceLastAction = Date.now() - lastUserAction;
    if (timeSinceLastAction > 2000 && (activeTasks.data || completedTasks.data)) {
      const timer = setTimeout(() => {
        updateMarkdownForTimerStates();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [activeTasks.data, completedTasks.data, lastUserAction]);

  const updateMarkdownForTimerStates = () => {
    if (!activeTasks.data && !completedTasks.data) return;
    
    const allTasks = [...(activeTasks.data || []), ...(completedTasks.data || [])];
    const lines = content.split('\n');
    let hasChanges = false;
    
    const updatedLines = lines.map(line => {
      const taskMatch = line.match(/^(\s*-\s*)\[([x\s])\](\s*)(.+)$/);
      if (taskMatch) {
        const taskText = taskMatch[4].trim();
        const existingTask = allTasks.find(task => task.text === taskText);
        const timerProgress = existingTask ? getTimerProgress(existingTask.id) : null;
        const hasTimer = timerProgress !== null;
        
        if (hasTimer && taskMatch[2] !== 'x') {
          // Task has timer but markdown shows unchecked - update it
          hasChanges = true;
          const indent = taskMatch[1];
          const spacing = taskMatch[3];
          return `${indent}[x]${spacing}${taskText}`;
        }
      }
      return line;
    });
    
    if (hasChanges) {
      onMarkdownUpdate(updatedLines.join('\n'));
    }
  };

  const findTaskByText = (text: string): Task | undefined => {
    // First check active tasks, then completed tasks
    const activeTask = (activeTasks.data || []).find(task => task.text === text);
    if (activeTask) return activeTask;
    
    const completedTask = (completedTasks.data || []).find(task => task.text === text);
    return completedTask;
  };

  const handleTaskToggle = async (taskText: string, checked: boolean) => {
    // Record user action timestamp to prevent timer sync conflicts
    setLastUserAction(Date.now());
    
    // Update markdown content immediately
    updateMarkdownContent(taskText, checked);
    
    // Use debounced database operations to prevent rapid fire updates
    const activeTask = (activeTasks.data || []).find(task => task.text === taskText);
    
    if (activeTask) {
      // Update existing active task
      updateTask.mutate({
        id: activeTask.id,
        completed: checked,
        checkedAt: checked ? Date.now() : null,
      });
    } else if (checked) {
      // Create new task if checking and no active task exists
      createTask.mutate({
        text: taskText,
        completed: checked,
        checkedAt: Date.now(),
      });
    }
  };

  const updateMarkdownContent = (taskText: string, checked: boolean) => {
    const lines = content.split('\n');
    const updatedLines = lines.map(line => {
      const taskMatch = line.match(/^(\s*-\s*)\[([x\s])\](\s*)(.+)$/);
      if (taskMatch && taskMatch[4].trim() === taskText) {
        const indent = taskMatch[1];
        const spacing = taskMatch[3];
        const checkbox = checked ? 'x' : ' ';
        return `${indent}[${checkbox}]${spacing}${taskText}`;
      }
      return line;
    });
    
    onMarkdownUpdate(updatedLines.join('\n'));
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
      const timerProgress = existingTask ? getTimerProgress(existingTask.id) : null;
      const hasTimer = timerProgress !== null;
      
      // Always use database state as source of truth to prevent flickering
      const actualCompleted = hasTimer ? true : (existingTask ? existingTask.completed : item.completed);

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
    <div className="flex-1 flex flex-col h-full">
      <div className="flex items-center justify-between px-3 md:px-6 py-3 bg-muted border-b border-border flex-shrink-0">
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

      <div className="flex-1 p-3 md:p-6 overflow-y-auto min-h-0">
        <div className="markdown-content space-y-2">
          {parsedContent.map(renderContent)}
        </div>
      </div>
    </div>
  );
}
