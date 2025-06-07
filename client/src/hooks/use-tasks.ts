import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Task, InsertTask, UpdateTask } from "@shared/schema";
import { extractTasksFromMarkdown } from "@/lib/markdown-parser";

export function useTasks() {
  const queryClient = useQueryClient();

  const activeTasks = useQuery<Task[]>({
    queryKey: ["/api/tasks/active"],
  });

  const completedTasks = useQuery<Task[]>({
    queryKey: ["/api/tasks/completed"],
  });

  const createTask = useMutation({
    mutationFn: async (task: InsertTask) => {
      const response = await apiRequest("POST", "/api/tasks", task);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, ...task }: UpdateTask & { id: number }) => {
      const response = await apiRequest("PATCH", `/api/tasks/${id}`, task);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
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
    },
  });

  return {
    activeTasks,
    completedTasks,
    createTask,
    updateTask,
    deleteTask,
    syncMarkdownTasks,
  };
}
