# EV Pulse Backend Blueprint

This folder provides a production-ready reference architecture for ingestion, summarization, moderation, scheduling, analytics, and X/Twitter publishing.

## Components
- `server.js`: Express API routes for public feed, admin moderation, and publishing.
- `services/newsIngestion.js`: RSS/API fetch, normalization, dedupe, categorization.
- `services/summarizer.js`: AI summary generation with strict factuality guardrails.
- `services/twitterPublisher.js`: Post formatter + publish handler with status tracking.
- `jobs/scheduler.js`: Cron-like orchestration for fetch/summarize/post pipelines.
- `db/schema.sql`: Relational schema for articles, summaries, tags, post history, analytics.
- `data/sample-articles.json`: Seed data representing EV Pulse content categories.

## Suggested stack
- Runtime: Node.js + TypeScript
- DB: PostgreSQL
- Queue/Scheduler: BullMQ + Redis or platform cron
- Auth: NextAuth/Auth.js (admin role only)
- AI: OpenAI Responses API with citation-preserving prompts
- Social publishing: X API v2
