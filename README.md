# THESIS TIMER

修論・卒論の提出締切までの残り時間を表示する、エヴァ風カウントダウンタイマーです。
**ブラウザだけで動作**します（Python不要）。

🔗 公開ページ: <https://n-haru0524.github.io/thesis_timer/>

## 使い方

ページを開くだけです。画面のボタンで表示を切り替えられます。

| ボタン | 説明 |
| --- | --- |
| **修論 / 卒論** | カウントダウン対象の締切を切り替え |
| **REMAIN** | 締切までの残り時間を表示（時:分:秒:1/100秒） |
| **ABSOLUTE** | 締切の絶対日時（年/月/日/時）を表示 |
| **START / STOP** | カウント表示の開始・停止 |
| **Enter / Esc** | 全画面の切り替え（Escで解除） |

残り時間に応じて背景色が変わります。

- **safe**: 締切まで7日（168時間）以上
- **warn**: 締切まで7日以内
- **danger**: 締切まで3日（72時間）以内、または締切超過

## 締切を変更する

[design/index.js](design/index.js) の先頭にある設定を書き換えて push するだけです。

```js
const DEADLINES = {
  bachelor: "2027-02-10T12:00:00+09:00", // 卒論
  master: "2027-02-02T15:00:00+09:00", // 修論
};
const WARN_HOURS = 168.0; // 7日: safe → warn
const DANGER_HOURS = 72.0; // 3日: warn → danger
```

- 日時は ISO 8601 形式。末尾の `+09:00` は日本時間（JST）を表します。
- `main` ブランチに push すると GitHub Actions が自動でサイトを更新します（1〜2分程度）。

## 仕組み・デプロイ

- 中身は `design/` フォルダ内の静的ファイル（HTML / CSS / JS）だけで、サーバーは不要です。
- `main` への push をトリガーに、[.github/workflows/deploy.yml](.github/workflows/deploy.yml) が `design/` を GitHub Pages へ公開します。

### 初回のみ必要な設定

リポジトリで Pages を一度だけ有効化してください。

1. **Settings → Pages → Build and deployment → Source** を **「GitHub Actions」** に設定
2. `main` に push（または Actions から該当ワークフローを Re-run）

以降は push するたびに自動でデプロイされます。

## ローカルで確認する

`design/` フォルダを静的サーバーで開くだけです（例: Python の簡易サーバー）。

```bash
cd design
python -m http.server 8000
# ブラウザで http://localhost:8000 を開く
```

> ファイルを直接 `file://` で開くと Web フォントの読み込みに失敗することがあるため、簡易サーバー経由を推奨します。
