import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Task, InsertTask, UpdateTask } from "@shared/schema";

export function useTasks() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const activeTasks = useQuery<Task[]>({
    queryKey: ["/api/tasks/active"],
    retry: false,
  });

  const completedTasks = useQuery<Task[]>({
    queryKey: ["/api/tasks/completed"],
    retry: false,
  });

  const timerTasks = useQuery<Task[]>({
    queryKey: ["/api/tasks/timers"],
    retry: false,
  });

  const createTask = useMutation({
    mutationFn: async (task: InsertTask) => {
      const response = await apiRequest("POST", "/api/tasks", task);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/completed"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/timers"] });
    },
    onError: (error) => {
      console.error("Task operation failed:", error);
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, ...task }: UpdateTask & { id: number }) => {
      const response = await apiRequest("PATCH", `/api/tasks/${id}`, task);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/completed"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/timers"] });
    },
    onError: (error) => {
      console.error("Task operation failed:", error);
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/completed"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/timers"] });
    },
    onError: (error) => {
      console.error("Task operation failed:", error);
    },
  });

  const syncMarkdownTasks = useMutation({
    mutationFn: async (markdownContent: string) => {
      const response = await apiRequest("POST", "/api/tasks/markdown", {
        markdownContent,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/completed"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/timers"] });
    },
    onError: (error) => {
      console.error("Task operation failed:", error);
    },
  });

  return {
    activeTasks,
    completedTasks,
    timerTasks,
    createTask,
    updateTask,
    deleteTask,
    syncMarkdownTasks,
  };
}
