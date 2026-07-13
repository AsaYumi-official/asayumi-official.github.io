import works from "../data/works.json";
import schedule from "../data/schedule.json";

// Browser-side CMS requests replace these values only after a successful response.
// Keeping these local sources here guarantees static-build fallback content.
export const getWorksData = async () => works;
export const getScheduleData = async () => schedule;
