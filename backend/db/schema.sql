CREATE TABLE sources (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  url TEXT NOT NULL,
  trust_score INT DEFAULT 80,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE articles (
  id UUID PRIMARY KEY,
  external_id TEXT,
  title TEXT NOT NULL,
  canonical_url TEXT UNIQUE NOT NULL,
  source_id INT REFERENCES sources(id),
  published_at TIMESTAMP NOT NULL,
  region VARCHAR(40) DEFAULT 'Global',
  brand VARCHAR(120),
  topic VARCHAR(80) NOT NULL,
  image_url TEXT,
  snippet TEXT,
  body TEXT,
  dedupe_hash CHAR(64) UNIQUE NOT NULL,
  ingest_status VARCHAR(20) DEFAULT 'new',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE summaries (
  id UUID PRIMARY KEY,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  version INT DEFAULT 1,
  headline TEXT NOT NULL,
  short_summary TEXT NOT NULL,
  bullets JSONB NOT NULL,
  why_it_matters TEXT,
  length_variant VARCHAR(20) DEFAULT 'standard',
  ai_model VARCHAR(80),
  confidence_score NUMERIC(4,3),
  needs_review BOOLEAN DEFAULT FALSE,
  editor_notes TEXT,
  approval_status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(60) UNIQUE NOT NULL
);

CREATE TABLE article_tags (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

CREATE TABLE social_posts (
  id UUID PRIMARY KEY,
  summary_id UUID REFERENCES summaries(id) ON DELETE CASCADE,
  platform VARCHAR(20) DEFAULT 'x',
  post_text TEXT NOT NULL,
  hashtags TEXT[],
  scheduled_for TIMESTAMP,
  published_at TIMESTAMP,
  external_post_id TEXT,
  status VARCHAR(20) DEFAULT 'queued',
  error_message TEXT,
  created_by VARCHAR(120),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE analytics_daily (
  day DATE,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  views INT DEFAULT 0,
  clicks INT DEFAULT 0,
  PRIMARY KEY (day, article_id)
);
