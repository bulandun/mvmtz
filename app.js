const state = {
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
      summary: "Rivian detailed a revised battery pack layout aimed at reducing module complexity and lowering production cost. The architecture targets better thermal control and faster assembly for the upcoming R2 line.",
      bullets: ["Fewer pack modules and simplified wiring", "Improved thermal channels for sustained fast charging", "Manufacturing changes intended to reduce cost per kWh"],
      why: "It could improve EV affordability in the midsize segment.",
      status: "draft",
      publishToX: false
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
      summary: "European regulators confirmed minimum high-power charger density targets along major freight and passenger corridors. Member states must report rollout milestones quarterly.",
      bullets: ["Mandated charger intervals on priority routes", "Quarterly compliance reporting required", "Funding linked to milestone performance"],
      why: "Standardized fast-charging access can reduce cross-border range anxiety.",
      status: "approved",
      publishToX: true
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
      summary: "BYD is scaling pilot production of sodium-ion batteries for short-range urban electric vehicles. The move targets material diversification and lower exposure to lithium volatility.",
      bullets: ["Pilot capacity raised for urban fleet applications", "Sodium-ion chemistry positioned for cost-sensitive segments", "Program designed to hedge battery raw-material swings"],
      why: "Alternative chemistries can reshape entry-level EV economics.",
      status: "approved",
      publishToX: false
    }
  ],
  postHistory: []
};

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
      <div class="meta">${a.date} • ${a.topic} • ${a.region}</div>
      <h3>${a.title}</h3>
      <p>${a.summary}</p>
      <ul>${a.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>
      <p><strong>Why it matters:</strong> ${a.why}</p>
      <a class="source" target="_blank" href="${a.link}">Source: ${a.source}</a>
    </article>
  `).join("");
}

function renderTop5() {
  const top = [...state.articles]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)
    .map((a) => `<li>${a.title} <span class="muted">(${a.source})</span></li>`)
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
    .map(([brand, count]) => `<span class="chip">${brand} • ${count}</span>`)
    .join("");
}

function postToX(article) {
  const hashtags = "#EV #ElectricVehicles #BatteryTech";
  const text = `${article.title}\n\n${article.bullets[0]}\nSource: ${article.source}\n${hashtags}`;
  state.postHistory.unshift({ title: article.title, text, when: new Date().toISOString(), status: "posted" });
}

function renderAdmin() {
  const queue = document.getElementById("adminQueue");
  const pending = state.articles.filter((a) => a.status !== "rejected");
  queue.innerHTML = pending.map((a) => `
    <div class="admin-item">
      <strong>${a.title}</strong>
      <div class="meta">Status: ${a.status} • Publish to X: ${a.publishToX ? "yes" : "no"}</div>
      <textarea data-id="${a.id}" rows="3">${a.summary}</textarea>
      <div class="admin-actions">
        <button onclick="updateSummary(${a.id})">Save edit</button>
        <button class="secondary" onclick="setStatus(${a.id}, 'approved')">Approve</button>
        <button class="secondary" onclick="setStatus(${a.id}, 'rejected')">Reject</button>
        <button class="secondary" onclick="toggleX(${a.id})">Toggle X</button>
      </div>
    </div>
  `).join("");

  document.getElementById("postHistory").innerHTML = state.postHistory
    .map((p) => `<li>${p.when} — ${p.status.toUpperCase()} — ${p.title}</li>`)
    .join("");
}

window.updateSummary = function (id) {
  const t = document.querySelector(`textarea[data-id='${id}']`);
  state.articles = state.articles.map((a) => (a.id === id ? { ...a, summary: t.value } : a));
  renderNews();
};

window.setStatus = function (id, status) {
  state.articles = state.articles.map((a) => (a.id === id ? { ...a, status } : a));
  const article = state.articles.find((a) => a.id === id);
  if (status === "approved" && article.publishToX) postToX(article);
  renderAdmin();
};

window.toggleX = function (id) {
  state.articles = state.articles.map((a) => (a.id === id ? { ...a, publishToX: !a.publishToX } : a));
  renderAdmin();
};

["searchInput", "topicFilter", "regionFilter"].forEach((id) => {
  document.getElementById(id).addEventListener("input", renderNews);
});

renderFilters();
renderTop5();
renderTrendingBrands();
renderNews();
renderAdmin();
