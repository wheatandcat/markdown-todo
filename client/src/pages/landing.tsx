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
            スマートタスク管理
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
            Markdownで作成したタスクが1時間後に自動完了する、生産性を向上させるタスク管理システム
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="px-8 py-4 text-lg"
              onClick={() => window.location.href = '/login'}
            >
              メールでログイン
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="px-8 py-4 text-lg"
              onClick={() => window.location.href = '/api/login'}
            >
              Replitでログイン
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <CardTitle>Markdownタスク</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Markdownのチェックボックス記法でタスクを簡単作成
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Clock className="h-12 w-12 mx-auto text-blue-500 mb-4" />
              <CardTitle>自動完了</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                チェックしたタスクは1時間後に自動で完了扱いになります
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BarChart3 className="h-12 w-12 mx-auto text-purple-500 mb-4" />
              <CardTitle>進捗追跡</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                詳細な統計情報で生産性を可視化して管理
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Zap className="h-12 w-12 mx-auto text-orange-500 mb-4" />
              <CardTitle>リアルタイム同期</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                すべてのデバイスでタスクが即座に同期されます
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Demo Section */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-center mb-8 text-slate-900 dark:text-slate-100">
            使い方
          </h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
                Markdownでタスクを記述：
              </h3>
              <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded font-mono text-sm">
                <div className="text-slate-700 dark:text-slate-300">
                  - [ ] プロジェクト提案書をレビュー<br/>
                  - [x] 朝の運動を完了<br/>
                  - [ ] フォローアップメールを送信<br/>
                  - [ ] 週末の予定を計画
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
                進捗を自動追跡：
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center text-slate-700 dark:text-slate-300">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  タスクをチェックしてタイマー開始
                </li>
                <li className="flex items-center text-slate-700 dark:text-slate-300">
                  <Clock className="h-4 w-4 mr-2 text-blue-500" />
                  1時間後に自動完了
                </li>
                <li className="flex items-center text-slate-700 dark:text-slate-300">
                  <BarChart3 className="h-4 w-4 mr-2 text-purple-500" />
                  詳細な統計情報を表示
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            生産性を向上させる準備はできましたか？
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
            タスク管理を変革した数千人のユーザーに参加しませんか
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="px-8 py-4 text-lg"
              onClick={() => window.location.href = '/login'}
            >
              メールでログイン
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="px-8 py-4 text-lg"
              onClick={() => window.location.href = '/api/login'}
            >
              Replitでログイン
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}