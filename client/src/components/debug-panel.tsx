import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, RefreshCw, Bug, Clock, Server, Database } from "lucide-react";
import { useTasks } from "@/hooks/use-tasks";
import { useTimers } from "@/hooks/use-timers";

interface HealthStatus {
  status: string;
  environment: string;
  tauri: boolean;
  timestamp: string;
  timerTasksCount: number;
  timerTasks: Array<{
    id: number;
    text: string;
    checkedAt: number;
    timeRemaining: number;
  }>;
}

interface LogData {
  status: string;
  logFile?: string;
  lineCount?: number;
  recentLines?: string[];
  lastModified?: string;
  error?: string;
}

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [healthData, setHealthData] = useState<HealthStatus | null>(null);
  const [logData, setLogData] = useState<LogData | null>(null);
  const [lastFetch, setLastFetch] = useState<string>("");
  const [error, setError] = useState<string>("");
  
  const { activeTasks, completedTasks, timerTasks } = useTasks();
  const { getTimerProgress, getRemainingTime } = useTimers();

  const fetchHealth = async () => {
    try {
      setError("");
      const baseUrl = window.location.protocol === 'tauri:' || (window as any).__TAURI__ 
        ? 'http://localhost:5001' 
        : '';
      
      const response = await fetch(`${baseUrl}/api/health`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setHealthData(data);
      setLastFetch(new Date().toLocaleTimeString());
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      console.error('[Debug Panel] Health check failed:', err);
    }
  };

  const fetchLogs = async () => {
    try {
      const baseUrl = window.location.protocol === 'tauri:' || (window as any).__TAURI__ 
        ? 'http://localhost:5001' 
        : '';
      
      const response = await fetch(`${baseUrl}/api/debug/logs`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setLogData(data);
    } catch (err) {
      console.error('[Debug Panel] Log fetch failed:', err);
      setLogData({ 
        status: 'error', 
        error: err instanceof Error ? err.message : 'Unknown error' 
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHealth();
      fetchLogs();
      const interval = setInterval(() => {
        fetchHealth();
        fetchLogs();
      }, 5000); // 5秒間隔で更新
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const getEnvironmentInfo = () => {
    // より詳細な環境検出
    const hasTauri = !!(window as any).__TAURI__;
    const isTauriProtocol = window.location.protocol === 'tauri:';
    const isTauriUA = navigator.userAgent.includes('Tauri');
    
    // デバッグ情報をコンソールに出力
    console.log('[Debug Panel] Environment detection:', {
      hasTauri,
      isTauriProtocol,
      isTauriUA,
      userAgent: navigator.userAgent,
      href: window.location.href,
      protocol: window.location.protocol,
      tauriObject: (window as any).__TAURI__
    });
    
    return {
      userAgent: navigator.userAgent,
      href: window.location.href,
      protocol: window.location.protocol,
      hasTauri: hasTauri || isTauriProtocol || isTauriUA,
      isTauriProtocol,
      isTauriUA,
      timestamp: new Date().toISOString()
    };
  };

  const envInfo = getEnvironmentInfo();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="bg-background/90 backdrop-blur-sm border shadow-lg"
          >
            <Bug className="w-4 h-4 mr-2" />
            Debug
            <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-2">
          <Card className="w-96 max-h-96 overflow-y-auto bg-background/95 backdrop-blur-sm border shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm">
                <span className="flex items-center">
                  <Bug className="w-4 h-4 mr-2" />
                  Debug Information
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={fetchHealth}
                  className="h-6 w-6 p-0"
                >
                  <RefreshCw className="w-3 h-3" />
                </Button>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4 text-xs">
              {/* Environment Info */}
              <div>
                <h4 className="font-medium flex items-center mb-2">
                  <Server className="w-3 h-3 mr-1" />
                  Environment
                </h4>
                <div className="space-y-1 text-xs">
                  <div>Protocol: <Badge variant="secondary">{envInfo.protocol}</Badge></div>
                  <div>Tauri Object: <Badge variant={envInfo.hasTauri ? "default" : "secondary"}>{envInfo.hasTauri ? "Yes" : "No"}</Badge></div>
                  <div>Tauri Protocol: <Badge variant={envInfo.isTauriProtocol ? "default" : "secondary"}>{envInfo.isTauriProtocol ? "Yes" : "No"}</Badge></div>
                  <div>Tauri UA: <Badge variant={envInfo.isTauriUA ? "default" : "secondary"}>{envInfo.isTauriUA ? "Yes" : "No"}</Badge></div>
                  <div>URL: <code className="text-xs bg-muted px-1 rounded">{envInfo.href}</code></div>
                </div>
              </div>

              {/* Server Health */}
              <div>
                <h4 className="font-medium flex items-center mb-2">
                  <Database className="w-3 h-3 mr-1" />
                  Server Health
                </h4>
                {error ? (
                  <div className="text-red-600 dark:text-red-400 text-xs">
                    <Badge variant="destructive">Error</Badge>
                    <div className="mt-1">{error}</div>
                  </div>
                ) : healthData ? (
                  <div className="space-y-1">
                    <div>Status: <Badge variant={healthData.status === 'ok' ? "default" : "destructive"}>{healthData.status}</Badge></div>
                    <div>Environment: <Badge variant="secondary">{healthData.environment}</Badge></div>
                    <div>Timer Tasks: <Badge variant="outline">{healthData.timerTasksCount}</Badge></div>
                    <div>Last Check: <span className="text-muted-foreground">{lastFetch}</span></div>
                  </div>
                ) : (
                  <Badge variant="secondary">Loading...</Badge>
                )}
              </div>

              {/* Client Tasks */}
              <div>
                <h4 className="font-medium flex items-center mb-2">
                  <Clock className="w-3 h-3 mr-1" />
                  Client Tasks
                </h4>
                <div className="space-y-1">
                  <div>Active: <Badge variant="outline">{activeTasks.data?.length || 0}</Badge></div>
                  <div>Completed: <Badge variant="outline">{completedTasks.data?.length || 0}</Badge></div>
                  <div>Timer: <Badge variant="outline">{timerTasks.data?.length || 0}</Badge></div>
                  {timerTasks.data && timerTasks.data.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs font-medium mb-1">Timer Details:</div>
                      {timerTasks.data.map(task => {
                        const progress = getTimerProgress(task.id);
                        const remaining = getRemainingTime(task.id);
                        return (
                          <div key={task.id} className="text-xs bg-muted p-2 rounded mb-1">
                            <div className="font-medium truncate">{task.text}</div>
                            <div>Progress: {progress?.toFixed(1) || 0}%</div>
                            <div>Remaining: {remaining ? Math.ceil(remaining / 1000 / 60) : 0}min</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Server Timer Tasks */}
              {healthData?.timerTasks && healthData.timerTasks.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Server Timer Tasks</h4>
                  {healthData.timerTasks.map(task => (
                    <div key={task.id} className="text-xs bg-blue-50 dark:bg-blue-950 p-2 rounded mb-1">
                      <div className="font-medium truncate">{task.text}</div>
                      <div>Remaining: {Math.ceil(task.timeRemaining / 1000 / 60)}min</div>
                      <div>Checked: {new Date(task.checkedAt).toLocaleTimeString()}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Server Logs */}
              {logData && (
                <div>
                  <h4 className="font-medium mb-2">Server Logs</h4>
                  {logData.error ? (
                    <div className="text-red-600 dark:text-red-400 text-xs">
                      <Badge variant="destructive">Error</Badge>
                      <div className="mt-1">{logData.error}</div>
                    </div>
                  ) : logData.recentLines ? (
                    <div className="text-xs">
                      <div className="mb-1">
                        File: <code className="bg-muted px-1 rounded">{logData.logFile}</code>
                      </div>
                      <div className="mb-1">Lines: {logData.lineCount}</div>
                      <div className="max-h-32 overflow-y-auto bg-muted p-2 rounded font-mono text-xs">
                        {logData.recentLines.map((line, i) => (
                          <div key={i} className={`${line.includes('ERROR') ? 'text-red-600 dark:text-red-400' : line.includes('Timer') ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                            {line}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Badge variant="secondary">No logs available</Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}