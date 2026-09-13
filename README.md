# Emo Image Editor

普通の写真を、記憶の中の写真のような雰囲気に変えるブラウザ完結型の画像加工アプリです。

画像はサーバーへ送信しません。アップロード・プリセット加工・比較・保存はすべて端末内で行われます。

## できること

- JPEG / PNG / WebP のアップロード（ファイル選択 / ドラッグ＆ドロップ）
- 8つのプリセット: Tide / Abyss / Summer / Dream / Film / Night / Memory / Fog
- Tide / Abyss は青く暗い、夜の湖のようなトーン
- 加工強度 0–100（初期値 50）
- 詳細調整: 明るさ・コントラスト・シャドウ・ハイライト・彩度・色温度・ブルー・色相・フェード・ヘイズ・ぼかし・ブルーム・粒子・ビネット
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
