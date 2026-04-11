import cron from "node-cron";
import { normalizeArticle, removeDuplicates } from "../services/newsIngestion.js";

/**
 * Example schedule strategy:
 * - every 3 hours: fetch fresh EV feeds/APIs
 * - every 30 min: summarize new stories
 * - every 5 min: publish approved/scheduled social posts
 */
export function startJobs({ fetchRawItems, persistArticles, summarizePending, publishScheduled }) {
  cron.schedule("0 */3 * * *", async () => {
    const rawItems = await fetchRawItems();
    const clean = removeDuplicates(rawItems.map(normalizeArticle));
    await persistArticles(clean);
  });

  cron.schedule("*/30 * * * *", summarizePending);
  cron.schedule("*/5 * * * *", publishScheduled);
}
