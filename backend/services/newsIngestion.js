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

export function buildDailySourceRoundup({ now = new Date() } = {}) {
  const today = now.toISOString().slice(0, 10);

  return [
    {
      id: `social-x-rivian-${today}`,
      title: "Rivian shares software rollout details for new highway assist update",
      headline: "Rivian highlights latest highway assist update",
      shortSummary:
        "Rivian posted a thread on X outlining improvements to lane centering confidence and driver-alert timing. The company says the update is being staged to vehicles over multiple days.",
      bullets: [
        "Phased OTA rollout is underway",
        "Driver monitoring prompts were adjusted",
        "Feature remains geofence-dependent"
      ],
      whyItMatters: "Software cadence increasingly shapes EV ownership satisfaction.",
      source: "Rivian on X",
      sourceType: "social",
      link: "https://x.com/Rivian",
      topic: "Autonomous driving",
      brand: "Rivian",
      region: "US",
      date: today,
      approvalStatus: "draft",
      publishToX: false
    },
    {
      id: `company-tesla-newsroom-${today}`,
      title: "Tesla publishes charging site expansion milestones in latest newsroom update",
      headline: "Tesla newsroom details recent Supercharger expansion",
      shortSummary:
        "Tesla's newsroom update lists newly opened and expanded fast-charging sites and reiterates utilization goals for peak corridors.",
      bullets: ["New high-traffic sites added", "Throughput focus at existing stations", "Regional build-out priorities updated"],
      whyItMatters: "Charging network density remains a top driver of practical EV adoption.",
      source: "Tesla Newsroom",
      sourceType: "automaker",
      link: "https://www.tesla.com/news",
      topic: "Charging infrastructure",
      brand: "Tesla",
      region: "US",
      date: today,
      approvalStatus: "draft",
      publishToX: false
    },
    {
      id: `company-byd-${today}`,
      title: "BYD investor update outlines battery supply and production guidance",
      headline: "BYD shares updated production and battery guidance",
      shortSummary:
        "In its latest corporate update, BYD emphasized pack production targets and supply-chain coordination to support upcoming EV launches.",
      bullets: ["Battery output targets reiterated", "Supply chain coordination highlighted", "Launch cadence guidance unchanged"],
      whyItMatters: "Production execution can quickly influence EV pricing and availability.",
      source: "BYD Corporate",
      sourceType: "automaker",
      link: "https://www.bydglobal.com/en/news",
      topic: "Manufacturing and supply chain",
      brand: "BYD",
      region: "China",
      date: today,
      approvalStatus: "draft",
      publishToX: false
    }
  ];
}
