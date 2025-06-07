import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuickAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTask: (task: string) => void;
}

export function QuickAddModal({
  open,
  onOpenChange,
  onAddTask,
}: QuickAddModalProps) {
  const [taskText, setTaskText] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskText.trim()) {
      return;
    }

    onAddTask(taskText);
    setTaskText("");
    onOpenChange(false);
    
    toast({
      title: "タスク追加",
      description: "タスクが追加されました。",
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md animate-slide-up">
        <DialogHeader>
          <DialogTitle>クイックタスク追加</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="taskInput">タスク内容</Label>
            <Input
              id="taskInput"
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="新しいタスクを入力..."
              className="w-full"
              autoFocus
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <Button type="submit" className="flex-1">
              <Plus className="w-4 h-4 mr-2" />
              追加
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              キャンセル
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
