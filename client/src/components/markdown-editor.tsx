import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { HelpCircle, PlusCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
  onInsertTemplate: () => void;
}

export function MarkdownEditor({
  content,
  onChange,
  onInsertTemplate,
}: MarkdownEditorProps) {
  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex items-center justify-between px-3 md:px-6 py-3 bg-muted border-b border-border flex-shrink-0">
        <h3 className="text-sm font-medium text-muted-foreground">
          Markdownエディター
        </h3>
        <div className="flex items-center space-x-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Markdownのヘルプ</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-primary"
                onClick={onInsertTemplate}
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>タスクテンプレートを挿入</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <Textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Markdownでタスクを書いてください...

例:
- [ ] 新しいタスク
- [x] 完了済みタスク
- [ ] もう一つのタスク`}
          className="absolute inset-3 md:inset-6 w-auto h-auto resize-none font-mono text-sm border-none focus:ring-0 focus:outline-none bg-transparent overflow-auto"
        />
      </div>
    </div>
  );
}
