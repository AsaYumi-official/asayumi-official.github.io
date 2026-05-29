# あさゆみ公式サイト

東京藝術大学卒の声楽家夫婦デュオ「あさゆみ」の公式サイトです。

演奏依頼、レッスン／ワークショップ、メディア／取材／広報関連のお問い合わせにつなげることを主目的にした、Astro 製の静的サイトです。

## 技術構成

- Astro
- 静的サイト
- GitHub Pages
- コンテンツは `src/data/*.json` に分離

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

ブラウザで `http://localhost:4321/asayumi-official-site/` を開きます。

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
https://asayumi-official.github.io/asayumi-official-site/
```

## 更新方法

Pages CMS などを後から導入しやすいように、更新頻度の高い情報は JSON に分けています。

| 内容 | ファイル |
| --- | --- |
| Home Hero | `src/data/homeHero.json` |
| News | `src/data/news.json` |
| Schedule | `src/data/schedule.json` |
| Works | `src/data/works.json` |
| Shop 商品 | `src/data/shop.json` |
| YouTube 最新動画URL | `src/data/youtube.json` |
| FAQ | `src/data/faq.json` |
| SNSリンク | `src/data/sns.json` |

## 公開前に差し替える項目

- `src/data/youtube.json` の `url`
- `src/pages/contact.astro` の `mailto:contact@example.com`
- `src/data/homeHero.json` の `image`
- プロフィール本文、出演歴、商品情報、公演情報

## デザイン方針

白と淡いベージュを基調に、余白を広く取り、スマートフォンで読みやすい構成にしています。写真を大きく扱えるよう、Home の Hero は横幅いっぱいのビジュアル領域を持たせています。
