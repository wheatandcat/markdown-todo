import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { Task } from "@shared/schema";
import { useTasks } from "./use-tasks";

const TIMER_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export function useTimers() {
  const queryClient = useQueryClient();
  const { updateTask, timerTasks } = useTasks();

  // Check and complete expired tasks
  useEffect(() => {
    if (!timerTasks.data) return;

    const checkTimers = () => {
      const now = Date.now();
      
      timerTasks.data.forEach((task) => {
        if (task.checkedAt && !task.completedAt) {
          const timeElapsed = now - task.checkedAt;
          
          if (timeElapsed >= TIMER_DURATION) {
            // Auto-complete the task
            updateTask.mutate({
              id: task.id,
              completedAt: now,
            });
          }
        }
      });
    };

    const interval = setInterval(checkTimers, 1000); // Check every second
    checkTimers(); // Check immediately

    return () => clearInterval(interval);
  }, [timerTasks.data, updateTask]);

  const getTimerProgress = (taskId: number): number | null => {
    if (!timerTasks.data) return null;
    
    const task = timerTasks.data.find(t => t.id === taskId);
    if (!task || !task.checkedAt || task.completedAt) return null;

    const timeElapsed = Date.now() - task.checkedAt;
    const progress = Math.min((timeElapsed / TIMER_DURATION) * 100, 100);
    
    return progress;
  };

  const getRemainingTime = (taskId: number): number | null => {
    if (!timerTasks.data) return null;
    
    const task = timerTasks.data.find(t => t.id === taskId);
    if (!task || !task.checkedAt || task.completedAt) return null;

    const timeElapsed = Date.now() - task.checkedAt;
    const remaining = Math.max(TIMER_DURATION - timeElapsed, 0);
    
    return remaining;
  };

  return {
    timerTasks,
    getTimerProgress,
    getRemainingTime,
  };
}
