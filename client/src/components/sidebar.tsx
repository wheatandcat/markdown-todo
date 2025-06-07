import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTasks } from "@/hooks/use-tasks";
import { useTimers } from "@/hooks/use-timers";
import { useTheme } from "@/components/theme-provider";
import { useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle,
  List,
  CheckCheck,
  Clock,
  BarChart3,
  Moon,
  Sun,
} from "lucide-react";

interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function Sidebar({ activeTab = "active", onTabChange }: SidebarProps = {}) {
  const [localActiveTab, setLocalActiveTab] = useState(activeTab);
  const queryClient = useQueryClient();
  const { activeTasks, completedTasks } = useTasks();
  const { timerTasks } = useTimers();
  const { theme, setTheme } = useTheme();

  const currentTab = onTabChange ? activeTab : localActiveTab;
  
  const handleTabClick = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setLocalActiveTab(tab);
    }
  };

  // Refresh counts every 5 seconds to ensure accuracy
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/completed"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/timers"] });
    }, 5000);

    return () => clearInterval(interval);
  }, [queryClient]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Debug logging
  console.log("Active tasks data:", activeTasks.data);
  console.log("Completed tasks data:", completedTasks.data);
  console.log("Timer tasks data:", timerTasks.data);

  const navItems = [
    {
      id: "active",
      label: "アクティブなタスク",
      icon: List,
      count: activeTasks.data?.length || 0,
      variant: "default" as const,
    },
    {
      id: "completed",
      label: "完了済みタスク",
      icon: CheckCheck,
      count: completedTasks.data?.length || 0,
      variant: "secondary" as const,
    },
    {
      id: "timers",
      label: "実行中のタイマー",
      icon: Clock,
      count: timerTasks.data?.length || 0,
      variant: "outline" as const,
    },
    {
      id: "stats",
      label: "統計",
      icon: BarChart3,
      count: null,
      variant: "ghost" as const,
    },
  ];

  return (
    <div className="w-64 h-full flex flex-col bg-sidebar dark:bg-sidebar border-r border-sidebar-border">
      {/* Header */}
      <div className="flex items-center flex-shrink-0 px-6 py-5 mb-6">
        <CheckCircle className="text-primary text-2xl mr-3 h-6 w-6" />
        <h1 className="text-xl font-bold text-sidebar-foreground">
          Markdown TODO
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              className="w-full justify-start px-3 py-2 h-auto"
              onClick={() => handleTabClick(item.id)}
            >
              <Icon className="mr-3 h-4 w-4 text-muted-foreground" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.count !== null && (
                <Badge variant={item.variant} className="ml-auto">
                  {item.count}
                </Badge>
              )}
            </Button>
          );
        })}
      </nav>

      {/* Theme Toggle */}
      <div className="flex-shrink-0 px-6 py-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start px-3 py-2"
          onClick={toggleTheme}
        >
          {theme === "dark" ? (
            <>
              <Sun className="mr-3 h-4 w-4 text-yellow-400" />
              ライトモード
            </>
          ) : (
            <>
              <Moon className="mr-3 h-4 w-4 text-muted-foreground" />
              ダークモード
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
