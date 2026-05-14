import express from "express";
import cron from "node-cron";
import sample from "./data/sample-articles.json" assert { type: "json" };
import { buildXPost } from "./services/twitterPublisher.js";
import { buildLiveSearchRoundup, removeDuplicates } from "./services/newsIngestion.js";

const app = express();
app.use(express.json());

let articles = sample;
let socialHistory = [];
let lastRefreshAtUtc = null;

function refreshLiveNews() {
  const liveSearchCards = buildLiveSearchRoundup();
  articles = removeDuplicates([...liveSearchCards, ...articles]);
  articles = articles.sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  lastRefreshAtUtc = new Date().toISOString();
}

refreshLiveNews();
cron.schedule("*/15 * * * *", refreshLiveNews);

app.get("/api/news", (req, res) => {
  const { topic = "all", region = "all", q = "" } = req.query;
  const filtered = articles.filter((a) => {
    const hit = `${a.title} ${a.shortSummary} ${a.brand}`.toLowerCase().includes(String(q).toLowerCase());
    const topicMatch = topic === "all" || a.topic === topic;
    const regionMatch = region === "all" || a.region === region;
    return hit && topicMatch && regionMatch;
  });
  res.json(filtered);
});

app.get("/api/news/meta", (_req, res) => {
  res.json({
    refreshedAtUtc: lastRefreshAtUtc,
    refreshScheduleUtc: "*/15 * * * *",
    sourceTypes: ["editorial", "social", "automaker"]
  });
});

app.post("/api/admin/refresh", (_req, res) => {
  refreshLiveNews();
  res.json({ ok: true, refreshedAtUtc: lastRefreshAtUtc });
});

app.post("/api/admin/:id/approve", (req, res) => {
  const article = articles.find((a) => a.id === req.params.id);
  if (!article) return res.status(404).json({ message: "Not found" });

  article.approvalStatus = "approved";
  if (article.publishToX) {
    const postText = buildXPost({
      headline: article.headline,
      shortSummary: article.shortSummary,
      source: article.source,
      url: article.link,
      hashtags: ["#EV", "#ElectricVehicles", "#BatteryTech"]
    });
    socialHistory.push({ articleId: article.id, postText, status: "queued" });
  }

  res.json({ ok: true, article });
});

app.get("/api/social/history", (_req, res) => res.json(socialHistory));

app.listen(3001, () => {
  console.log("MVMT ZERO byte API running on :3001");
});
