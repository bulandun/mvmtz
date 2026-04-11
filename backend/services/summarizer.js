/**
 * AI summarization contract:
 * - never fabricate facts
 * - preserve source meaning
 * - output headline + 2-3 sentence summary + 3 bullets + optional why it matters
 * - if uncertain/conflicting, mark needsReview=true
 */

export async function summarizeArticleWithAI({ client, article, length = "standard" }) {
  const prompt = `You are MVMT ZERO's factual editor.\n
Return JSON with:
headline, shortSummary, bullets[3], whyItMatters, needsReview.
Constraints:
- Never invent facts.
- Keep professional, sharp, accessible tone.
- Preserve source meaning.
- Flag uncertain/conflicting claims with needsReview=true.`;

  const input = `TITLE: ${article.title}\nSOURCE: ${article.source}\nSNIPPET: ${article.snippet}\nBODY: ${article.body}\nLENGTH:${length}`;

  const response = await client.responses.create({
    model: "gpt-5-mini",
    input: [{ role: "system", content: prompt }, { role: "user", content: input }],
    response_format: { type: "json_object" }
  });

  const parsed = JSON.parse(response.output_text);
  return {
    headline: parsed.headline,
    shortSummary: parsed.shortSummary,
    bullets: parsed.bullets,
    whyItMatters: parsed.whyItMatters || null,
    needsReview: Boolean(parsed.needsReview)
  };
}

export function toSocialVariant(summary) {
  return `${summary.headline}\n\n${summary.bullets[0]}\n${summary.bullets[1]}`;
}
