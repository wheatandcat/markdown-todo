interface ParsedItem {
  id: number;
  type: "heading" | "task" | "paragraph";
  text: string;
  level?: number;
  completed?: boolean;
}

export function parseMarkdownTasks(content: string): ParsedItem[] {
  const lines = content.split("\n");
  const result: ParsedItem[] = [];
  let id = 0;

  for (const line of lines) {
    if (!line.trim()) continue;

    // Check for headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      result.push({
        id: id++,
        type: "heading",
        text: headingMatch[2],
        level: headingMatch[1].length,
      });
      continue;
    }

    // Check for tasks
    const taskMatch = line.match(/^[ \t]*-[ \t]*\[([x\s])\][ \t]*(.+)$/);
    if (taskMatch) {
      result.push({
        id: id++,
        type: "task",
        text: taskMatch[2].trim(),
        completed: taskMatch[1] === "x",
      });
      continue;
    }

    // Regular paragraph
    if (line.trim()) {
      result.push({
        id: id++,
        type: "paragraph",
        text: line.trim(),
      });
    }
  }

  return result;
}

export function extractTasksFromMarkdown(content: string) {
  const taskRegex = /^[ \t]*-[ \t]*\[([x\s])\][ \t]*(.+)$/gm;
  const matches = [...content.matchAll(taskRegex)];
  
  return matches.map((match, index) => ({
    id: index,
    text: match[2].trim(),
    completed: match[1] === 'x',
  }));
}
