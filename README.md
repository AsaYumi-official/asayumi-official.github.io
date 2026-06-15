# あさゆみ公式サイト

東京藝術大学卒の声楽家夫婦デュオ「あさゆみ」の公式サイトです。

演奏依頼、レッスン／ワークショップ、メディア／取材／広報関連のお問い合わせにつなげることを主目的にした、Astro 製の静的サイトです。

## 技術構成

- Astro
- 静的サイト
- GitHub Pages
- コンテンツは `src/data/*.json` と `src/content/news/*.md` に分離

## ページ構成

- Home: `/`
- Profile: `/profile/`
- Works: `/works/`
- Schedule: `/schedule/`
- Contact: `/contact/`
- Shop: `/shop/`

## ローカル起動

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:4321/` を開きます。

## ビルド

```bash
npm run build
npm run preview
```

## GitHub Pages での公開

`.github/workflows/deploy.yml` に GitHub Pages 用のワークフローを入れています。

1. GitHub のリポジトリ設定で Pages の Source を `GitHub Actions` にします。
2. `main` ブランチへマージします。
3. GitHub Actions が `npm ci` と `npm run build` を実行します。
4. `dist/` が GitHub Pages にデプロイされます。

公開URLの想定:

```text
https://asayumi-official.github.io/
```

## 更新方法

Pages CMS などを後から導入しやすいように、更新頻度の高い情報は JSON と Markdown に分けています。

| 内容 | ファイル |
| --- | --- |
| Home Hero | `src/data/homeHero.json` |
| News | `src/content/news/*.md` |
| Schedule | `src/data/schedule.json` |
| Works | `src/data/works.json` |
| Profile | `src/data/profile.json` |
| YouTube 最新動画 | `src/data/youtube.json` |
| FAQ | `src/data/faq.json` |
| SNSリンク | `src/data/sns.json` |
| Contactフォーム | `src/data/contact.json` |

### News の追加方法

`src/content/news/` に Markdown ファイルを追加します。ファイル名は `YYYY-MM-DD-title.md` のようにしておくと管理しやすいです。

```md
---
title: "お知らせタイトル"
date: 2026-06-10
summary: "一覧に表示する短い説明"
image: "/images/news-example.jpg"
imageAlt: "画像の説明"
published: true
---

本文をここに書きます。
```

`published: false` にすると下書きとして残せます。

### Works の追加方法

`src/data/works.json` を編集します。

- Home の活動内容は `activities`
- Works ページの活動実績は `achievements`

Works ページで使うカテゴリは、現在以下に絞っています。

- コンサート
- 学校・公共施設
- イベント・式典
- メディア出演
- レコーディング

レッスン単体は活動実績ページには出さず、Contact の「レッスン／ワークショップ」導線で扱います。

### Schedule の追加方法

`src/data/schedule.json` に予定を追加します。

```json
{
  "date": "2026-09-21",
  "time": "14:00",
  "title": "あさゆみ 2ndリサイタル 大阪公演",
  "type": "performance",
  "label": "出演予定",
  "location": "大阪",
  "url": "",
  "description": "大阪でのリサイタル公演。"
}
```

`type` は `performance` / `youtube` / `sns` を想定しています。

### YouTube 最新動画

<<<<<<< ours
`src/data/youtube.json` にHomeへ固定表示する3本の動画を置いています。

各動画は `title` / `subtitle` / `url` / `videoId` を持ちます。iframe には `videoId` から生成した `https://www.youtube-nocookie.com/embed/{videoId}` だけを使います。`videoId` が空の場合のみ `url` から抽出し、取得できない場合はそのカードのiframeを出さずにYouTubeへのリンクだけを表示します。

`.github/workflows/deploy.yml` では1日1回の定期ビルドと手動実行 `workflow_dispatch` を設定しています。現在のYouTube表示は固定データのため、動画差し替え時は `src/data/youtube.json` を更新して再ビルドします。

### Google Sheets 簡易CMS化の方針

まだCMSは導入せず、現在はローカルJSON/Markdownを正とします。将来、GoogleスプレッドシートとApps Script JSON endpointへ移行する場合は、`src/lib/contentSources.ts` の取得先を環境変数で切り替えます。
=======
HomeのYouTubeは、Googleスプレッドシート「あさゆみHP」を公開するGoogle Apps Script JSON endpointから取得します。取得できない場合は `src/data/youtube.json` のfallbackを表示します。

`youtube.featured` が代表動画3本、`youtube.latest` が最新動画1本です。Youtubeタブの `latest` 行を書き換えると、Homeの最新動画枠が変わります。`featured` 行は代表動画3本です。

各動画は `title` / `subtitle` / `url` / `videoId` を持ちます。iframe には `videoId` から生成した `https://www.youtube-nocookie.com/embed/{videoId}` だけを使います。`videoId` が空の場合のみ `url` から抽出し、取得できない場合はそのカードのiframeを出さずにYouTubeへのリンクだけを表示します。

`.github/workflows/deploy.yml` では1日1回の定期ビルドと手動実行 `workflow_dispatch` を設定しています。YouTubeはブラウザ側でもGAS endpointを取得するため、CORSが許可されていればスプレッドシート変更だけで差し替わります。取得できない場合は `src/data/youtube.json` をfallbackとして使います。

### Google Sheets 簡易CMS化の方針

GAS endpoint URLは `src/data/siteApi.json` で管理します。取得処理の土台は `src/lib/siteCms.ts` にまとめています。

News / Works / Schedule は今後同じGAS endpointから連動予定です。現時点ではページ側の既存表示を壊さないよう、取得失敗時にローカルJSON/Markdownまたは空配列へfallbackする構造にしています。

Inquiries は問い合わせ保存専用で、公開JSONには含めません。サイト側でInquiriesを読み込んだり表示したりしないでください。

imageUrl には画像ファイル本体ではなく、公開済み画像のURLを入れてください。
>>>>>>> theirs

想定する環境変数:

- `WORKS_JSON_ENDPOINT`
- `SCHEDULE_JSON_ENDPOINT`

推奨列:

News:

- `title`
- `date`
- `summary`
- `body`
- `image`
- `imageAlt`
- `published`

Works:

- `date`
- `title`
- `category`
- `location`
- `description`
- `image`

Schedule:

- `date`
- `time`
- `title`
- `type`
- `label`
- `location`
- `url`
- `description`

Google Sheets JSON endpointを使う場合も、取得失敗時はローカルJSON/Markdownをfallbackとして使う構成にします。GitHub Actionsの定期ビルドにより、外部データを定期的に反映できます。

## 公開前に差し替える項目

<<<<<<< ours
- `src/data/youtube.json` の `videos`
=======
- `src/data/youtube.json` の `featured` / `latest`
>>>>>>> theirs
- `src/data/contact.json` の Google Apps Script Web App URL
- `src/data/homeHero.json` の `image`
- `public/images/` 配下のロゴ、プロフィール、Works、News、OGP画像
- プロフィール本文、出演歴、公演情報

## デザイン方針

白と淡いベージュを基調に、余白を広く取り、スマートフォンで読みやすい構成にしています。Home の Hero は縦長写真を扱いやすい2カラム構成です。
