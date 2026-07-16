# あさゆみ公式サイト

東京藝術大学卒の声楽家夫婦デュオ「あさゆみ」の公式サイトです。Astroで生成する静的サイトに、Googleスプレッドシート「あさゆみHP」をブラウザから読み込むCMS機能を組み合わせています。

## 技術構成

- Astro
- 静的サイト / GitHub Pages
- Google Apps Script（Googleスプレッドシートの公開CMS）
- ローカルJSON・Markdownによる通信失敗時のfallback

## ページ構成

- Home: `/`
- News: `/news/`
- Works: `/works/`
- Schedule: `/schedule/`
- Profile: `/profile/`
- Contact: `/contact/`
- Shop: `/shop/`

## ローカル起動とビルド

```bash
npm install
npm run dev
npm run check
npm run build
```

## スプレッドシートでの日常更新

スプレッドシートを保存してからサイトを再読み込みすると、最新の公開データが反映されます。通常のコンテンツ更新では、GitHubへのpush・PR・再デプロイは不要です。

| タブ | 更新される場所 | 主な更新内容 |
| --- | --- | --- |
| `Youtube` | Home | `latest` で最新動画1件、`featured` で代表動画最大3件 |
| `News` | Home・News一覧・News詳細 | お知らせ本文、画像、公開状態 |
| `Works` | Works | 活動実績、カテゴリ、画像、公開状態 |
| `Schedule` | Schedule | カレンダー、当月一覧、公開状態 |

### GAS endpoint

公開CMS endpointは [`src/data/siteApi.json`](src/data/siteApi.json) だけで管理します。必ず次のような `script.google.com/macros/s/.../exec` のURLを保存してください。

```text
https://script.google.com/macros/s/.../exec
```

`script.googleusercontent.com/macros/echo` 形式のURLを `siteApi.json` に保存しないでください。

サイトは `youtube` / `news` / `works` / `schedule` を個別に取得します。`Inquiries` は問い合わせPOST保存専用です。公開CMSのGET対象には含めず、ブラウザ側で読み込み・表示もしません。

### 公開状態と入力値

- `published` は `true`、`"true"`、`"TRUE"`、`1`、`"1"` を公開として扱います。`false`、`"false"`、`"FALSE"`、`0`、`"0"` は非公開です。
- `published` 列がない既存データは後方互換のため表示します。
- `News` の `id` または `slug` は一意にしてください。値がある記事は `/news/detail/?id=...` の詳細ページを開けます。
- `imageUrl` にはブラウザで直接開ける公開画像URLを入力してください。
- リンク・画像URLには `https://`、`http://`、またはサイト内の `/` から始まるパスだけを使用してください。
- YouTubeのiframeには11文字の動画IDから作る `https://www.youtube-nocookie.com/embed/{videoId}` だけを使います。

## fallbackについて

CMSへの通信、HTTP応答、JSON解析に失敗した場合は、静的ビルド時のローカルデータを表示します。

- YouTube: `src/data/youtube.json`
- News: `src/content/news/*.md`
- Works: `src/data/works.json`
- Schedule: `src/data/schedule.json`

CMSが正常に空配列を返した場合はfallbackへ戻らず、「お知らせはありません」などの空表示になります。

## GitHub Pagesでの公開

初回公開やサイトコード・デザイン変更時は、`main` へ反映してGitHub Actionsからビルド・デプロイします。日常的なYouTube、News、Works、Scheduleの更新は上記のスプレッドシート運用で行います。

## 公開前に差し替える項目

- `src/data/contact.json` の問い合わせ用Google Apps Script URL
- `src/data/homeHero.json` の画像
- `public/images/` 配下のロゴ、プロフィール、Works、OGP画像
- プロフィール本文、出演歴
