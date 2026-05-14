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

function decodeXml(value = "") {
  return value
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function parseGoogleNewsRss(xml, query) {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 8);

  return items.map((item, index) => {
    const block = item[1];
    const title = decodeXml((block.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "").trim());
    const link = decodeXml((block.match(/<link>([\s\S]*?)<\/link>/)?.[1] || "").trim());
    const pubDate = (block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || "").trim();
    const source = decodeXml((block.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] || query.source).trim());
    const snippet = decodeXml((block.match(/<description>([\s\S]*?)<\/description>/)?.[1] || "").trim());

    return {
      id: `live-rss-${hash(`${link}-${pubDate}`).slice(0, 12)}-${index}`,
      title,
      headline: title,
      shortSummary: snippet || `Latest ${query.topic.toLowerCase()} item from ${source}.`,
      bullets: [
        "Pulled from live EV news RSS feed",
        "Link opens the original reporting source",
        "Card updates automatically throughout the day"
      ],
      whyItMatters: "This item is sourced from a live feed to keep EV coverage current.",
      source,
      sourceType: query.sourceType,
      link,
      topic: query.topic,
      brand: query.brand,
      region: query.region,
      date: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      approvalStatus: "draft",
      publishToX: false
    };
  }).filter((item) => item.title && item.link);
}

export async function fetchLatestEvNews() {
  const responses = await Promise.allSettled(
    LIVE_SOURCE_QUERIES.map(async (query) => {
      const rssUrl = `${query.url}&hl=en-US&gl=US&ceid=US:en&output=rss`;
      const response = await fetch(rssUrl);
      if (!response.ok) {
        throw new Error(`Failed RSS fetch for ${query.topic}`);
      }
      const xml = await response.text();
      return parseGoogleNewsRss(xml, query);
    })
  );

  return responses
    .filter((result) => result.status === "fulfilled")
    .flatMap((result) => result.value);
}
