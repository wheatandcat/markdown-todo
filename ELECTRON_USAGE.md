# 🖥️ Electronアプリ使用ガイド

## エラー修正内容

ElectronアプリでES Moduleエラーが発生していた問題を修正しました：

### 修正内容
1. TypeScriptコンパイル後のファイル拡張子を`.cjs`に変更
2. スクリプトでファイル名を自動変換
3. プリロードスクリプトのパス参照を修正

## 使用方法

### 1. サーバーが起動中の場合（推奨）
```bash
./scripts/electron-only.sh
```

### 2. サーバーも同時起動する場合
```bash
./scripts/dev-electron.sh
```

### 3. 手動実行
```bash
# TypeScriptファイルをコンパイル
npx tsc --project electron/tsconfig.json

# ファイル拡張子を変更
mv electron/dist/main.js electron/dist/main.cjs
mv electron/dist/preload.js electron/dist/preload.cjs

# Electronアプリを起動
electron electron/dist/main.cjs
```

## 動作要件

- Node.js 18以上
- Electronパッケージ（既にインストール済み）
- 開発サーバーが http://localhost:5000 で動作中

## 機能

- macOSネイティブメニューバー（日本語）
- ダークモード自動対応
- ウィンドウ管理
- キーボードショートカット
- セキュアなプリロード設定

これでCommonJS互換性の問題が解決され、正常にElectronアプリが起動するはずです。