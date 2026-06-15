import siteApi from "../data/siteApi.json";
import youtubeFallback from "../data/youtube.json";
import worksFallback from "../data/works.json";
import scheduleFallback from "../data/schedule.json";

export type CmsTarget = "youtube" | "news" | "works" | "schedule";

export type CmsVideo = {
  title: string;
  subtitle?: string;
  url: string;
  videoId?: string;
  publishedAt?: string;
};

export type CmsYoutube = {
  title: string;
  channelUrl: string;
  featured: CmsVideo[];
  latest?: CmsVideo;
};

export type SiteCmsPayload = {
  youtube: CmsYoutube;
  news: unknown[];
  works: unknown[];
  schedule: unknown[];
  generatedAt?: string;
};

const fallbackPayload: SiteCmsPayload = {
  youtube: youtubeFallback,
  news: [],
  works: worksFallback.achievements,
  schedule: scheduleFallback,
};

const endpointWithTarget = (target?: CmsTarget) => {
  if (!target) return siteApi.endpoint;
  const separator = siteApi.endpoint.includes("?") ? "&" : "?";
  return `${siteApi.endpoint}${separator}target=${target}`;
};

const fetchCmsJson = async <T>(target: CmsTarget | undefined, fallback: T): Promise<T> => {
  try {
    const response = await fetch(endpointWithTarget(target));
    if (!response.ok) return fallback;
    const data = await response.json();
    return data as T;
  } catch {
    return fallback;
  }
};

export const getSiteCms = () => fetchCmsJson<SiteCmsPayload>(undefined, fallbackPayload);
export const getCmsYoutube = () => fetchCmsJson<CmsYoutube>("youtube", youtubeFallback);
export const getCmsNews = () => fetchCmsJson<unknown[]>("news", []);
export const getCmsWorks = () => fetchCmsJson<unknown[]>("works", worksFallback.achievements);
export const getCmsSchedule = () => fetchCmsJson<unknown[]>("schedule", scheduleFallback);
export const getCmsEndpoint = () => siteApi.endpoint;
