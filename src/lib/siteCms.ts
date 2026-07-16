import siteApi from "../data/siteApi.json";
import youtubeFallback from "../data/youtube.json";
import worksFallback from "../data/works.json";
import scheduleFallback from "../data/schedule.json";
import type { CmsNews, CmsSchedule, CmsWork } from "./siteCmsClient";

export type CmsTarget = "youtube" | "news" | "works" | "schedule";

export type CmsYoutubeFallback = {
  title: string;
  channelUrl: string;
  featured: Array<{
    title: string;
    subtitle?: string;
    url: string;
    videoId?: string;
    publishedAt?: string;
  }>;
  latest?: {
    title: string;
    subtitle?: string;
    url: string;
    videoId?: string;
    publishedAt?: string;
  };
};

type CmsResponse<T> = T | Partial<Record<CmsTarget, T>>;

const endpointWithTarget = (target: CmsTarget) => {
  const separator = siteApi.endpoint.includes("?") ? "&" : "?";
  return `${siteApi.endpoint}${separator}target=${encodeURIComponent(target)}&_=${Date.now()}`;
};

const unwrapTarget = <T>(payload: CmsResponse<T>, target: CmsTarget): T => {
  if (typeof payload === "object" && payload !== null && !Array.isArray(payload)) {
    const wrapped = payload as Partial<Record<CmsTarget, T>>;
    if (target in wrapped) return wrapped[target] as T;
  }
  return payload as T;
};

const fetchCmsJson = async <T>(target: CmsTarget, fallback: T): Promise<T> => {
  try {
    const response = await fetch(endpointWithTarget(target), { cache: "no-store" });
    if (!response.ok) return fallback;
    const payload = await response.json() as CmsResponse<T>;
    return unwrapTarget(payload, target);
  } catch {
    return fallback;
  }
};

// These server helpers preserve local fallback data for builds and are kept separate
// from the browser client, which performs the live CMS updates after page load.
export const getCmsYoutube = () => fetchCmsJson<CmsYoutubeFallback>("youtube", youtubeFallback);
export const getCmsNews = () => fetchCmsJson<CmsNews[]>("news", []);
export const getCmsWorks = () => fetchCmsJson<CmsWork[]>("works", worksFallback.achievements);
export const getCmsSchedule = () => fetchCmsJson<CmsSchedule[]>("schedule", scheduleFallback);
export const getCmsEndpoint = () => siteApi.endpoint;
