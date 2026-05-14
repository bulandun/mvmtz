import crypto from "node:crypto";

const EV_TOPICS = [
  "EV launches",
  "Battery technology",
  "Charging infrastructure",
  "Autonomous driving",
  "Policy and regulation",
  "Market and finance",
  "Manufacturing and supply chain",
  "China EV market",
  "Europe EV market",
  "US EV market"
];

const LIVE_SOURCE_QUERIES = [
  {
    source: "Google News",
    sourceType: "editorial",
    topic: "Battery technology",
    brand: "Industry",
    region: "Global",
    url: "https://news.google.com/search?q=EV+battery+technology"
  },
  {
    source: "Google News",
    sourceType: "editorial",
    topic: "Charging infrastructure",
    brand: "Industry",
    region: "Global",
    url: "https://news.google.com/search?q=EV+charging+infrastructure"
  },
  {
    source: "Google News",
    sourceType: "editorial",
    topic: "Market and finance",
    brand: "Industry",
    region: "US",
    url: "https://news.google.com/search?q=US+EV+market"
  },
  {
    source: "Google News",
    sourceType: "editorial",
    topic: "China EV market",
    brand: "Industry",
    region: "China",
    url: "https://news.google.com/search?q=China+EV+market"
  },
  {
    source: "Google News",
    sourceType: "editorial",
    topic: "Europe EV market",
    brand: "Industry",
    region: "Europe",
    url: "https://news.google.com/search?q=Europe+EV+market"
  }
];

export function normalizeArticle(raw) {
  const text = `${raw.title || ""} ${raw.snippet || ""}`.trim();
  return {
    title: raw.title,
    canonicalUrl: raw.link,
    source: raw.source,
    publishedAt: raw.pubDate,
    imageUrl: raw.image || null,
    snippet: raw.snippet || "",
    body: raw.body || "",
    topic: classifyTopic(text),
    dedupeHash: hash(text.toLowerCase())
  };
}

export function removeDuplicates(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.dedupeHash) || seen.has(item.canonicalUrl)) return false;
    seen.add(item.dedupeHash);
    seen.add(item.canonicalUrl);
    return true;
  });
}

export function classifyTopic(text) {
  const checks = [
    ["battery", "Battery technology"],
    ["charging", "Charging infrastructure"],
    ["policy", "Policy and regulation"],
    ["autonomous", "Autonomous driving"],
    ["factory", "Manufacturing and supply chain"],
    ["launch", "EV launches"],
    ["market", "Market and finance"],
    ["china", "China EV market"],
    ["europe", "Europe EV market"],
    ["us", "US EV market"]
  ];

  const lower = text.toLowerCase();
  const match = checks.find(([needle]) => lower.includes(needle));
  return match ? match[1] : EV_TOPICS[0];
}

function hash(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function buildLiveSearchRoundup({ now = new Date() } = {}) {
  const timestamp = now.toISOString();
  return LIVE_SOURCE_QUERIES.map((query) => ({
    id: `live-search-${hash(`${query.url}-${timestamp}`).slice(0, 12)}`,
    title: `Live EV watch: ${query.topic}`,
    headline: `Monitoring ${query.topic.toLowerCase()} updates`,
    shortSummary: `Fresh query prepared for ${query.source} to keep the EV feed updated with recent coverage in ${query.region}.`,
    bullets: [
      "Search query targets current EV headlines",
      "Use this link to find the latest stories",
      "Summaries can be generated after source review"
    ],
    whyItMatters: "Continuous discovery helps keep EV monitoring current throughout the day.",
    source: query.source,
    sourceType: query.sourceType,
    link: query.url,
    topic: query.topic,
    brand: query.brand,
    region: query.region,
    date: timestamp,
    approvalStatus: "draft",
    publishToX: false
  }));
}
