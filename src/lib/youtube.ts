type YouTubeConfig = {
  title: string;
  url: string;
  caption: string;
  channelUrl: string;
  feedUrl?: string;
};

type LatestVideo = {
  title: string;
  url: string;
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

export async function getLatestYouTubeVideo(config: YouTubeConfig): Promise<LatestVideo> {
  const fallback: LatestVideo = {
    title: config.title,
    url: config.url,
    caption: config.caption,
    channelUrl: config.channelUrl,
  };

  try {
    const meta = import.meta as ImportMeta & { env?: Record<string, string | undefined> };
    const channelId = meta.env?.YOUTUBE_CHANNEL_ID;
    const feedUrl = channelId
      ? `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
      : config.feedUrl && !config.feedUrl.includes("CHANNEL_ID")
        ? config.feedUrl
        : "";
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
      url: toEmbedUrl(videoId),
      caption: title ? `最新動画: ${title}` : config.caption,
      channelUrl: config.channelUrl,
    };
  } catch {
    return fallback;
  }
}
