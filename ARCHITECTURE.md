# EV Pulse: Full App Structure & Workflow

## Recommended project layout (Next.js App Router)

```text
/ev-pulse
  /app
    /(public)
      page.tsx                # Homepage: featured + feed + filters + top 5
      article/[slug]/page.tsx # SEO-friendly article page
    /(admin)
      admin/page.tsx          # Moderation queue + manual edits
      admin/analytics/page.tsx
    /api
      news/route.ts           # GET public feed
      ingest/route.ts         # POST ingestion trigger
      summarize/route.ts      # POST AI summary generation
      social/publish/route.ts # POST publish to X
  /components
    NewsCard.tsx
    Filters.tsx
    TopFive.tsx
    TrendingBrands.tsx
    AdminEditor.tsx
  /lib
    db.ts
    auth.ts
    rss.ts
    news-api.ts
    summarizer.ts
    x-client.ts
  /jobs
    ingestion.ts
    summarization.ts
    publishing.ts
  /prisma
    schema.prisma
  /backend
    ... (reference implementation in this repo)
```

## Admin workflow
1. Ingestion job fetches EV stories from RSS/API.
2. Dedup + normalize + categorize into one of EV Pulse topic buckets.
3. AI summary pipeline generates headline, short summary, bullets, and optional "Why it matters".
4. Flag uncertain/conflicting output for manual review.
5. Admin reviews queue, edits text, and sets status: draft/approved/rejected.
6. If `publishToX=true`, create post draft and schedule immediate or delayed publish.
7. Store social publishing result and expose status in history panel.

## Summary length variants
- `ultra_short`: 1 sentence + 2 bullets
- `standard`: 2-3 sentences + 3 bullets + optional context
- `social`: compressed post-ready format for X with source mention and hashtags

## SEO + analytics
- Generate metadata from approved summary headline + source.
- Add structured data (`NewsArticle`) to article pages.
- Store `views` and `topic_clicks` in daily aggregates to power analytics dashboard.

## Safety & editorial controls
- Hard rule: never fabricate facts.
- Preserve source intent and qualifiers.
- On ambiguity or conflicting details, mark summary `needs_review=true` and block auto-publish.
