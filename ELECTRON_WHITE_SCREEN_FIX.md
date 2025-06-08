# Electron白い画面問題の解決方法

## 問題の概要
パッケージ化されたElectronアプリを起動すると白い画面が表示される問題が発生することがあります。これは主に以下の原因によるものです：

1. **ファイルパスの不整合** - プロダクション環境でのHTML/CSS/JSファイルのパス解決
2. **サーバー起動の失敗** - 内蔵サーバーが正常に起動しない
3. **静的ファイルの配信問題** - Reactアプリの静的ファイルが適切に配信されない

## 実装された解決策

### 1. 複数パス検索機能
Electronアプリは以下の順序でファイルを検索します：
```typescript
const possiblePaths = [
  join(__dirname, '../dist/public/index.html'),
  join(process.resourcesPath, 'dist/public/index.html'),
  join(process.resourcesPath, 'app/dist/public/index.html')
];
```

### 2. 静的ファイルサーバー
内蔵の静的ファイルサーバーが自動的に起動し、以下の機能を提供します：
- MIMEタイプの適切な設定
- SPAルーティングサポート
- セキュリティ保護（ディレクトリトラバーサル防止）

### 3. フォールバック機能
- 静的サーバーが失敗した場合、外部サーバーにフォールバック
- 開発環境では外部サーバー要求
- エラー時の詳細なログ出力

## ビルド手順

### 推奨方法
```bash
# 最終修正版（白い画面修正済み）
sh ./scripts/build-electron-final.sh
```

### 軽量版
```bash
# 直接ビルド（フロントエンド再ビルドなし）
sh ./scripts/build-electron-direct.sh
```

## トラブルシューティング

### 白い画面が表示される場合

1. **コンソールログの確認**
   - アプリケーション → ユーティリティ → コンソールで確認
   - "スマートタスク管理"でフィルタリング

2. **ファイル構造の確認**
   ```bash
   # ビルド前にファイルが存在することを確認
   ls -la dist/public/index.html
   ls -la electron/dist/main.js
   ```

3. **開発者ツールでの診断**
   - 開発モードで起動して確認
   - ネットワークタブでリソース読み込み状況をチェック

### よくあるエラーと対処法

#### "Failed to load file://"
- **原因**: ファイルパスが正しくない
- **解決**: `build-electron-final.sh`を使用してビルド

#### "Server connection failed"
- **原因**: 静的サーバーの起動失敗
- **解決**: ポート5000が使用可能か確認

#### "White screen on startup"
- **原因**: React アプリの初期化失敗
- **解決**: `npm run build`で フロントエンドを再ビルド

## 開発者向け情報

### ファイル構造
```
dist-electron/
├── mac/
│   └── スマートタスク管理.app/
└── スマートタスク管理-1.0.0.dmg

dist/
├── public/
│   ├── index.html
│   └── assets/
└── index.js (サーバー)

electron/
└── dist/
    ├── main.js
    ├── preload.js
    └── static-server.js
```

### デバッグ方法
開発モードでElectronアプリを起動：
```bash
# 開発サーバーを起動
npm run dev

# 別ターミナルでElectronを起動
npx electron electron/dist/main.js
```

### カスタマイズ
静的サーバーのポートやパスを変更する場合：
1. `electron/main.ts`のPORT定数を変更
2. `electron/static-server.ts`のpossibleRootsを調整
3. 再コンパイル: `cd electron && npx tsc`

## パフォーマンス最適化

### ビルド時間短縮
- フロントエンドが既にビルド済みの場合は`build-electron-direct.sh`を使用
- 不要なnode_modulesを除外するためfilterconfigを調整

### アプリサイズ削減
- `electron.config.cjs`の`files`配列で不要ファイルを除外
- 本番用依存関係のみパッケージに含める

この解決策により、パッケージ化されたElectronアプリの白い画面問題は根本的に解決されます。