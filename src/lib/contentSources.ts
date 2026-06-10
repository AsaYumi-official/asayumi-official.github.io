import works from "../data/works.json";
import schedule from "../data/schedule.json";

type RemoteOptions<T> = {
  envKey: string;
  fallback: T;
};

const fetchJsonSource = async <T>({ envKey, fallback }: RemoteOptions<T>): Promise<T> => {
  const meta = import.meta as ImportMeta & { env?: Record<string, string | undefined> };
  const endpoint = meta.env?.[envKey];
  if (!endpoint) return fallback;

  try {
    const response = await fetch(endpoint);
    if (!response.ok) return fallback;
    return await response.json() as T;
  } catch {
    return fallback;
  }
};

export const getWorksData = () => fetchJsonSource({
  envKey: "WORKS_JSON_ENDPOINT",
  fallback: works,
});

export const getScheduleData = () => fetchJsonSource({
  envKey: "SCHEDULE_JSON_ENDPOINT",
  fallback: schedule,
});
