import siteApi from "../data/siteApi.json";

export type CmsTarget = "youtube" | "news" | "works" | "schedule";

type CmsRecord = Record<string, unknown>;

export type CmsVideo = {
  title: string;
  subtitle?: string;
  url?: string;
  videoId?: string;
};

export type CmsYoutube = {
  featured: CmsVideo[];
  latest: CmsVideo | null;
};

export type CmsNews = {
  id?: string;
  slug?: string;
  date: string;
  title: string;
  summary?: string;
  body?: string;
  imageUrl?: string;
  imageAlt?: string;
};

export type CmsWork = {
  id?: string;
  date: string;
  title: string;
  category: string;
  location?: string;
  description?: string;
  imageUrl?: string;
};

export type CmsSchedule = {
  id?: string;
  date: string;
  time?: string;
  title: string;
  type: string;
  label?: string;
  location?: string;
  url?: string;
  description?: string;
};

export type CmsFetchResult<T> =
  | { ok: true; data: T }
  | { ok: false };

const videoIdPattern = /^[0-9A-Za-z_-]{11}$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^\d{1,2}:\d{2}$/;

const isRecord = (value: unknown): value is CmsRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const text = (value: unknown) => typeof value === "string" ? value.trim() : "";

const optionalText = (value: unknown) => {
  const valueAsText = text(value);
  return valueAsText || undefined;
};

export const safeUrl = (value: unknown) => {
  const href = text(value);
  if (!href) return undefined;
  if (href.startsWith("/") && !href.startsWith("//")) return href;

  try {
    const parsed = new URL(href);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? href : undefined;
  } catch {
    return undefined;
  }
};

const isPublished = (item: CmsRecord) => {
  if (!("published" in item)) return true;
  const value = item.published;
  if (value === true || value === 1) return true;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1";
  }
  return false;
};

const date = (value: unknown) => {
  const normalized = text(value);
  return datePattern.test(normalized) ? normalized : "";
};

const time = (value: unknown) => {
  const normalized = text(value);
  return timePattern.test(normalized) ? normalized : undefined;
};

const videoIdFromUrl = (url: string | undefined) => {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be" || parsed.hostname.endsWith(".youtu.be")) {
      return parsed.pathname.split("/").filter(Boolean)[0] || "";
    }
    if (parsed.hostname === "youtube.com" || parsed.hostname.endsWith(".youtube.com")) {
      if (parsed.pathname.startsWith("/shorts/")) return parsed.pathname.split("/")[2] || "";
      return parsed.searchParams.get("v") || "";
    }
  } catch {
    return "";
  }
  return "";
};

const normalizeVideo = (value: unknown): CmsVideo | null => {
  if (!isRecord(value) || !isPublished(value)) return null;
  const url = safeUrl(value.url);
  const listedVideoId = text(value.videoId);
  const videoId = videoIdPattern.test(listedVideoId) ? listedVideoId : videoIdFromUrl(url);
  const normalizedVideoId = videoIdPattern.test(videoId) ? videoId : undefined;
  const title = text(value.title) || "YouTube";

  if (!normalizedVideoId && !url) return null;
  return {
    title,
    subtitle: optionalText(value.subtitle),
    url,
    videoId: normalizedVideoId,
  };
};

const normalizeNewsItem = (value: unknown): CmsNews | null => {
  if (!isRecord(value) || !isPublished(value)) return null;
  const itemDate = date(value.date);
  const title = text(value.title);
  if (!itemDate || !title) return null;

  return {
    id: optionalText(value.id),
    slug: optionalText(value.slug),
    date: itemDate,
    title,
    summary: optionalText(value.summary),
    body: optionalText(value.body),
    imageUrl: safeUrl(value.imageUrl) || safeUrl(value.image),
    imageAlt: optionalText(value.imageAlt),
  };
};

const normalizeWorkItem = (value: unknown): CmsWork | null => {
  if (!isRecord(value) || !isPublished(value)) return null;
  const itemDate = date(value.date);
  const title = text(value.title);
  const category = text(value.category);
  if (!itemDate || !title || !category) return null;

  return {
    id: optionalText(value.id),
    date: itemDate,
    title,
    category,
    location: optionalText(value.location),
    description: optionalText(value.description),
    imageUrl: safeUrl(value.imageUrl) || safeUrl(value.image),
  };
};

const normalizeScheduleItem = (value: unknown): CmsSchedule | null => {
  if (!isRecord(value) || !isPublished(value)) return null;
  const itemDate = date(value.date);
  const title = text(value.title);
  if (!itemDate || !title) return null;

  return {
    id: optionalText(value.id),
    date: itemDate,
    time: time(value.time),
    title,
    type: text(value.type) || "performance",
    label: optionalText(value.label),
    location: optionalText(value.location),
    url: safeUrl(value.url),
    description: optionalText(value.description),
  };
};

const extractList = (value: unknown, target: "news" | "works" | "schedule") => {
  if (Array.isArray(value)) return value;
  if (isRecord(value) && Array.isArray(value[target])) return value[target];
  return undefined;
};

const normalizeNews = (value: unknown) => {
  const items = extractList(value, "news");
  if (!items) return null;
  return items
    .map(normalizeNewsItem)
    .filter((item): item is CmsNews => item !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
};

const normalizeWorks = (value: unknown) => {
  const items = extractList(value, "works");
  if (!items) return null;
  return items
    .map(normalizeWorkItem)
    .filter((item): item is CmsWork => item !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
};

const normalizeSchedule = (value: unknown) => {
  const items = extractList(value, "schedule");
  if (!items) return null;
  return items
    .map(normalizeScheduleItem)
    .filter((item): item is CmsSchedule => item !== null)
    .sort((a, b) => `${a.date}T${a.time || "00:00"}`.localeCompare(`${b.date}T${b.time || "00:00"}`));
};

const normalizeYoutube = (value: unknown): CmsYoutube | null => {
  const payload = isRecord(value) && isRecord(value.youtube) ? value.youtube : value;
  if (!isRecord(payload) || !Array.isArray(payload.featured)) return null;
  const latest = normalizeVideo(payload.latest);
  return {
    featured: payload.featured
      .map(normalizeVideo)
      .filter((item): item is CmsVideo => item !== null)
      .slice(0, 3),
    latest,
  };
};

const requestUrl = (target: CmsTarget) => {
  const separator = siteApi.endpoint.includes("?") ? "&" : "?";
  return `${siteApi.endpoint}${separator}target=${encodeURIComponent(target)}&_=${Date.now()}`;
};

const fetchCms = async <T>(target: CmsTarget, normalize: (value: unknown) => T | null): Promise<CmsFetchResult<T>> => {
  try {
    const response = await fetch(requestUrl(target), { cache: "no-store" });
    if (!response.ok) return { ok: false };
    const normalized = normalize(await response.json());
    return normalized === null ? { ok: false } : { ok: true, data: normalized };
  } catch {
    return { ok: false };
  }
};

export const fetchCmsYoutube = () => fetchCms("youtube", normalizeYoutube);
export const fetchCmsNews = () => fetchCms("news", normalizeNews);
export const fetchCmsWorks = () => fetchCms("works", normalizeWorks);
export const fetchCmsSchedule = () => fetchCms("schedule", normalizeSchedule);

export const getYoutubeEmbedUrl = (video: CmsVideo) =>
  video.videoId && videoIdPattern.test(video.videoId)
    ? `https://www.youtube-nocookie.com/embed/${video.videoId}`
    : undefined;

export const getYoutubeWatchUrl = (video: CmsVideo) =>
  video.url || (video.videoId ? `https://www.youtube.com/watch?v=${video.videoId}` : undefined);
