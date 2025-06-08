# macOSアプリデプロイメントガイド

## 修正済みの問題

✅ **ES Module設定ファイルエラー**: `electron.config.js` → `electron.config.cjs`に変更  
✅ **package.json依存関係エラー**: electron/electron-builderをdevDependenciesに自動移動  
✅ **設定ファイル構造エラー**: 無効な`main`プロパティを削除  
✅ **ビルドプロセス最適化**: エラーハンドリングと自動復元機能を追加  
✅ **環境変数設定**: メモリ制限とコード署名の最適化  

## ローカルビルド手順

### 1. 前提条件確認
```bash
# Node.js バージョン確認
node --version  # v20以上推奨

# ビルド設定テスト
sh ./scripts/test-build-fix.sh
```

### 2. ビルド実行
```bash
# 白い画面修正版ビルド（推奨）
sh ./scripts/build-electron-final-fixed.sh

# または標準ビルド
sh ./scripts/build-electron-final.sh
```

**白い画面修正版の特徴**:
- localhost:5001サーバー強制使用（file://プロトコル回避）
- ポート競合完全解決（開発:5000、プロダクション:5002、Electron:5001）
- 自動接続リトライ機能
- 静的ファイル配信確保

### 3. ビルド成果物確認
```bash
# 生成されたファイル確認
ls -la dist-electron/
```

期待される出力：
- `スマートタスク管理-1.0.0-arm64.dmg` (Apple Silicon Mac用)
- `スマートタスク管理-1.0.0-x64.dmg` (Intel Mac用)
- `スマートタスク管理-1.0.0-arm64-mac.zip`
- `スマートタスク管理-1.0.0-x64-mac.zip`

## トラブルシューティング

### エラー: "require() of ES Module" / "ReferenceError: exports is not defined"
**原因**: CommonJSとES Moduleの競合、vite.config.tsでのtop-level await  
**解決方法**: 最終修正版ビルドスクリプトを使用
```bash
sh ./scripts/build-electron-final.sh
```

### エラー: Electronアプリで白い画面が表示される
**原因**: パッケージ化されたアプリでのファイルパス不整合、静的ファイル配信の問題  
**解決方法**: 白い画面修正版を含む最終ビルドスクリプトを使用
```bash
sh ./scripts/build-electron-final.sh
```
**詳細**: `ELECTRON_WHITE_SCREEN_FIX.md`を参照

### エラー: "Cannot find module"
```bash
# 依存関係を再インストール
rm -rf node_modules package-lock.json
npm install
```

### エラー: "Code signing failed"
```bash
# 開発者証明書なしでビルド
export CSC_IDENTITY_AUTO_DISCOVERY=false
sh ./scripts/build-electron.sh
```

### ビルド時間の最適化
```bash
# 単一アーキテクチャのみビルド（テスト用）
npx electron-builder --mac --x64 --config electron.config.cjs
```

## 配布方法

### DMGファイル配布
1. `dist-electron/`フォルダからDMGファイルを取得
2. 他のMacユーザーに直接配布可能
3. ユーザーは「アプリケーション」フォルダにドラッグ&ドロップでインストール

### ZIPファイル配布
1. より軽量なZIPファイルを使用
2. ユーザーが解凍後に.appファイルを実行

## セキュリティ注意事項

### macOS Gatekeeper
- 開発者証明書がない場合、初回起動時にセキュリティ警告が表示
- ユーザーは「システム設定」→「プライバシーとセキュリティ」で許可が必要

### 回避方法（配布時にユーザーに説明）
```bash
# コマンドラインでの実行（一時的）
xattr -cr /Applications/スマートタスク管理.app
```

## 自動配布設定（オプション）

### GitHub Releases
`electron.config.cjs`の`publish`設定を有効化することで、GitHub Releasesに自動アップロード可能。

### 必要な設定
1. GitHubリポジトリ作成
2. Personal Access Token設定
3. 設定ファイル内のowner/repo名を更新

これで安定したmacOSアプリの配布が可能になります。