import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, BarChart3, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Smart Task Management
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
            Transform your productivity with markdown-powered tasks that auto-complete after one hour
          </p>
          <Button 
            size="lg" 
            className="px-8 py-4 text-lg"
            onClick={() => window.location.href = '/api/login'}
          >
            Get Started
          </Button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <CardTitle>Markdown Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Create tasks using simple checkbox syntax in markdown
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Clock className="h-12 w-12 mx-auto text-blue-500 mb-4" />
              <CardTitle>Auto-Complete</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Tasks automatically complete after 1 hour when checked
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BarChart3 className="h-12 w-12 mx-auto text-purple-500 mb-4" />
              <CardTitle>Progress Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Monitor your productivity with detailed statistics
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Zap className="h-12 w-12 mx-auto text-orange-500 mb-4" />
              <CardTitle>Real-time Sync</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Your tasks sync instantly across all your devices
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Demo Section */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-center mb-8 text-slate-900 dark:text-slate-100">
            How It Works
          </h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
                Write tasks in markdown:
              </h3>
              <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded font-mono text-sm">
                <div className="text-slate-700 dark:text-slate-300">
                  - [ ] Review project proposal<br/>
                  - [x] Complete morning workout<br/>
                  - [ ] Send follow-up emails<br/>
                  - [ ] Plan weekend activities
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
                Track progress automatically:
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center text-slate-700 dark:text-slate-300">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Check tasks to start timer
                </li>
                <li className="flex items-center text-slate-700 dark:text-slate-300">
                  <Clock className="h-4 w-4 mr-2 text-blue-500" />
                  Auto-complete after 1 hour
                </li>
                <li className="flex items-center text-slate-700 dark:text-slate-300">
                  <BarChart3 className="h-4 w-4 mr-2 text-purple-500" />
                  View detailed statistics
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Ready to boost your productivity?
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
            Join thousands of users who have transformed their task management
          </p>
          <Button 
            size="lg" 
            className="px-8 py-4 text-lg"
            onClick={() => window.location.href = '/api/login'}
          >
            Start Managing Tasks
          </Button>
        </div>
      </div>
    </div>
  );
}