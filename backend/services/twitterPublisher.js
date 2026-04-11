export function buildXPost({ headline, shortSummary, source, url, hashtags = [] }) {
  const base = `${headline}\n\n${shortSummary}\nSource: ${source}`;
  const tagLine = hashtags.length ? `\n${hashtags.join(" ")}` : "";
  const linkPart = url ? `\n${url}` : "";
  return `${base}${tagLine}${linkPart}`.slice(0, 280);
}

export async function publishToX({ xClient, postText }) {
  try {
    const result = await xClient.tweets.createTweet({ text: postText });
    return { status: "published", externalPostId: result.data.id, error: null };
  } catch (error) {
    return { status: "failed", externalPostId: null, error: error.message };
  }
}
