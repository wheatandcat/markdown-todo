# 🖥️ macOSアプリ ビルドガイド

このガイドでは、スマートタスク管理をElectronを使ってmacOSアプリとしてビルドする方法を説明します。

## 🚀 クイックスタート

### 開発モード
```bash
# Electronアプリを開発モードで起動
./scripts/dev-electron.sh
```

### プロダクションビルド
```bash
# macOSアプリをビルド
./scripts/build-electron.sh
```

## 📁 Electron関連ファイル構成

```
electron/
├── main.ts              # メインプロセス（アプリウィンドウ管理）
├── preload.ts           # プリロードスクリプト（セキュリティ）
├── tsconfig.json        # TypeScript設定
├── entitlements.mac.plist # macOS権限設定
└── assets/              # アプリアイコンなど

scripts/
├── dev-electron.sh      # 開発用スクリプト
└── build-electron.sh    # ビルド用スクリプト

electron.config.js       # Electron Builder設定
```

## ⚙️ 機能

### ネイティブmacOS統合
- **メニューバー**: 日本語メニュー完全対応
- **ウィンドウ管理**: macOSネイティブな操作感
- **キーボードショートカット**: Command+Q、Command+W等
- **ダークモード**: システム設定に自動対応

### セキュリティ
- **コンテキスト分離**: レンダラープロセスとメインプロセスの分離
- **プリロード**: 安全なAPI公開
- **権限管理**: 必要最小限の権限のみ

## 🔧 カスタマイズ

### アプリアイコン
`electron/assets/` にアイコンファイルを配置：
- `icon.icns` - macOSアプリアイコン
- `dmg-background.png` - DMGインストーラー背景

### アプリ情報変更
`electron.config.js` で設定変更可能：
```js
{
  appId: 'com.smarttask.manager',
  productName: 'スマートタスク管理',
  // ...
}
```

## 📦 配布

### DMGファイル作成
```bash
npm run build
npx tsc --project electron/tsconfig.json
npx electron-builder --mac
```

### App Store配布準備
1. Apple Developer Program登録
2. 証明書とプロビジョニングプロファイル設定
3. App Store用ビルド実行

## 🐛 トラブルシューティング

### よくある問題

**Q: アプリが起動しない**
A: サーバーが正常に起動していることを確認してください。

**Q: データベース接続エラー**
A: PostgreSQL設定とDATABASE_URL環境変数を確認してください。

**Q: 署名エラー**
A: macOS開発者証明書が正しく設定されていることを確認してください。

### デバッグ
開発者ツールを有効にするには：
```bash
# 開発モードで自動的に開発者ツールが開きます
./scripts/dev-electron.sh
```

## 📋 必要な環境

- macOS 10.15 (Catalina) 以上
- Node.js 18以上
- Xcode Command Line Tools
- （配布用）Apple Developer Program登録

## 🔄 アップデート配信

GitHub Releasesを使った自動アップデート機能も設定済みです：

1. GitHubでリリースを作成
2. アプリが自動でアップデートを検知
3. ユーザーに通知してアップデート実行

---

**これでmacOSネイティブアプリとして快適にタスク管理を利用できます！**