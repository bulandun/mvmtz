const state = {
  brandLogos: {
    Rivian: "https://logo.clearbit.com/rivian.com",
    BYD: "https://logo.clearbit.com/byd.com",
    "Public Policy": "https://logo.clearbit.com/europa.eu"
  },
  articles: [
    {
      id: 1,
      title: "Rivian reveals next-gen battery pack architecture for R2 platform",
      source: "Electrek",
      date: "2026-04-11",
      topic: "Battery technology",
      region: "US",
      brand: "Rivian",
      link: "https://example.com/rivian-r2-battery",
      image: "https://source.unsplash.com/1200x675/?rivian,electric%20vehicle",
      summary: "Rivian detailed a revised battery pack layout aimed at reducing module complexity and lowering production cost. The architecture targets better thermal control and faster assembly for the upcoming R2 line.",
      bullets: ["Fewer pack modules and simplified wiring", "Improved thermal channels for sustained fast charging", "Manufacturing changes intended to reduce cost per kWh"],
      why: "It could improve EV affordability in the midsize segment."
    },
    {
      id: 2,
      title: "EU finalizes charging corridor targets across TEN-T routes",
      source: "Reuters",
      date: "2026-04-10",
      topic: "Charging infrastructure",
      region: "Europe",
      brand: "Public Policy",
      link: "https://example.com/eu-charging-corridor",
      image: "https://source.unsplash.com/1200x675/?europe,ev,charging,station",
      summary: "European regulators confirmed minimum high-power charger density targets along major freight and passenger corridors. Member states must report rollout milestones quarterly.",
      bullets: ["Mandated charger intervals on priority routes", "Quarterly compliance reporting required", "Funding linked to milestone performance"],
      why: "Standardized fast-charging access can reduce cross-border range anxiety."
    },
    {
      id: 3,
      title: "BYD expands sodium-ion pilot line for city EV programs",
      source: "Bloomberg",
      date: "2026-04-09",
      topic: "Manufacturing and supply chain",
      region: "China",
      brand: "BYD",
      link: "https://example.com/byd-sodium-ion",
      image: "https://source.unsplash.com/1200x675/?BYD,electric%20car",
      summary: "BYD is scaling pilot production of sodium-ion batteries for short-range urban electric vehicles. The move targets material diversification and lower exposure to lithium volatility.",
      bullets: ["Pilot capacity raised for urban fleet applications", "Sodium-ion chemistry positioned for cost-sensitive segments", "Program designed to hedge battery raw-material swings"],
      why: "Alternative chemistries can reshape entry-level EV economics."
    }
  ]
};

function buildFallbackImage(article) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#232a38" />
        <stop offset="100%" stop-color="#56627d" />
      </linearGradient>
    </defs>
    <rect width="1200" height="675" fill="url(#g)" />
    <text x="50%" y="48%" text-anchor="middle" fill="#ffffff" font-size="56" font-family="Inter, Arial, sans-serif" font-weight="700">${article.brand}</text>
    <text x="50%" y="58%" text-anchor="middle" fill="#d6dceb" font-size="32" font-family="Inter, Arial, sans-serif">${article.topic}</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function resolveStoryImage(article) {
  if (article.image) return article.image;
  const seed = encodeURIComponent(`${article.id}-${article.brand}-${article.topic}`);
  return `https://picsum.photos/seed/${seed}/1200/675`;
}

function renderFilters() {
  const topicFilter = document.getElementById("topicFilter");
  [...new Set(state.articles.map((a) => a.topic))].forEach((topic) => {
    const opt = document.createElement("option");
    opt.value = topic;
    opt.textContent = topic;
    topicFilter.appendChild(opt);
  });
}

function getFilteredArticles() {
  const q = document.getElementById("searchInput").value.toLowerCase();
  const topic = document.getElementById("topicFilter").value;
  const region = document.getElementById("regionFilter").value;

  return state.articles.filter((a) => {
    const hit = `${a.title} ${a.summary} ${a.brand} ${a.topic}`.toLowerCase().includes(q);
    const topicMatch = topic === "all" || a.topic === topic;
    const regionMatch = region === "all" || a.region === region;
    return hit && topicMatch && regionMatch;
  });
}

function renderNews() {
  const grid = document.getElementById("newsGrid");
  const filtered = getFilteredArticles();
  document.getElementById("resultCount").textContent = `${filtered.length} stories`;

  grid.innerHTML = filtered.map((a) => `
    <article class="card">
      <img
        class="story-image"
        src="${resolveStoryImage(a)}"
        alt="${a.brand} related to ${a.title}"
        loading="lazy"
        onerror="this.onerror=null;this.src='${buildFallbackImage(a)}';"
      />
      <div class="meta">${a.date} • ${a.topic} • ${a.region}</div>
      <h3>${a.title}</h3>
      <p>${a.summary}</p>
      <ul>${a.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>
      <p><strong>Why it matters:</strong> ${a.why}</p>
      <a class="source" target="_blank" rel="noopener noreferrer" href="${a.link}">Source: ${a.source}</a>
    </article>
  `).join("");
}

function renderTop5() {
  const top = [...state.articles]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)
    .map((a) => `<li>${a.title} <span class="meta">(${a.source})</span></li>`)
    .join("");
  document.getElementById("topHeadlines").innerHTML = top;
}

function renderTrendingBrands() {
  const counts = state.articles.reduce((acc, a) => {
    acc[a.brand] = (acc[a.brand] || 0) + 1;
    return acc;
  }, {});
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  document.getElementById("trendingBrands").innerHTML = sorted
    .map(([brand, count]) => `
      <span class="chip">
        <img
          class="brand-logo"
          src="${state.brandLogos[brand] || `https://logo.clearbit.com/${encodeURIComponent(brand)}.com`}"
          alt="${brand} logo"
          loading="lazy"
          onerror="this.style.display='none';"
        />
        ${brand} • ${count}
      </span>
    `)
    .join("");
}

["searchInput", "topicFilter", "regionFilter"].forEach((id) => {
  document.getElementById(id).addEventListener("input", renderNews);
});

renderFilters();
renderTop5();
renderTrendingBrands();
renderNews();
