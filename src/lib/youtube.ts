type YouTubeConfig = {
  title: string;
  url: string;
  caption: string;
  channelUrl: string;
  handle?: string;
  feedUrl?: string;
};

type LatestVideo = {
  title: string;
  url: string;
  embedUrl: string;
  caption: string;
  channelUrl: string;
};

const timeoutFetch = async (url: string, init?: RequestInit) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
};

const textFromXml = (xml: string, tag: string) => {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return match?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, "").trim() ?? "";
};

const toEmbedUrl = (videoId: string) => `https://www.youtube.com/embed/${videoId}`;
const toWatchUrl = (videoId: string) => `https://www.youtube.com/watch?v=${videoId}`;

const resolveFeedUrl = async (config: YouTubeConfig) => {
  const meta = import.meta as ImportMeta & { env?: Record<string, string | undefined> };
  const channelId = meta.env?.YOUTUBE_CHANNEL_ID;
  if (channelId) return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  if (config.feedUrl) return config.feedUrl;

  const handle = config.handle || config.channelUrl.match(/@([^/?#]+)/)?.[1];
  if (!handle) return "";

  const page = await timeoutFetch(`https://www.youtube.com/@${handle}`);
  if (!page.ok) return "";
  const html = await page.text();
  const resolvedId = html.match(/"channelId":"(UC[^"]+)"/)?.[1]
    || html.match(/youtube\.com\/channel\/(UC[0-9A-Za-z_-]+)/)?.[1];
  return resolvedId ? `https://www.youtube.com/feeds/videos.xml?channel_id=${resolvedId}` : "";
};

export async function getLatestYouTubeVideo(config: YouTubeConfig): Promise<LatestVideo> {
  const fallback: LatestVideo = {
    title: config.title,
    url: config.url,
    embedUrl: config.url,
    caption: config.caption,
    channelUrl: config.channelUrl,
  };

  try {
    const feedUrl = await resolveFeedUrl(config);
    if (!feedUrl) return fallback;

    const feed = await timeoutFetch(feedUrl);
    if (!feed.ok) return fallback;
    const xml = await feed.text();
    const firstEntry = xml.match(/<entry>([\s\S]*?)<\/entry>/)?.[1];
    if (!firstEntry) return fallback;

    const videoId = textFromXml(firstEntry, "yt:videoId");
    const title = textFromXml(firstEntry, "title");
    if (!videoId) return fallback;

    return {
      title: title || config.title,
      url: toWatchUrl(videoId),
      embedUrl: toEmbedUrl(videoId),
      caption: title ? `最新動画: ${title}` : config.caption,
      channelUrl: config.channelUrl,
    };
  } catch {
    return fallback;
  }
}
