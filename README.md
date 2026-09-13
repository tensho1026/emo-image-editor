# Emo Image Editor

普通の写真を、記憶の中の写真のような雰囲気に変えるブラウザ完結型の画像加工アプリです。

画像はサーバーへ送信しません。アップロード・プリセット加工・比較・保存はすべて端末内で行われます。

## できること

- JPEG / PNG / WebP のアップロード（ファイル選択 / ドラッグ＆ドロップ）
- 5つのプリセット: Summer / Dream / Film / Night / Memory
- 加工強度 0–100（初期値 50）
- Original / Edited の切り替え比較
- JPEG / PNG ダウンロード
- 大きな画像はプレビュー用に最大 1920px へ縮小

## 開発

```bash
npm install
npm run dev
```

本番ビルド:

```bash
npm run build
npm run preview
```

## 技術

React / TypeScript / Vite / Tailwind CSS / HTML Canvas API
