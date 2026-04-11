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
