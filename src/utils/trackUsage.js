/**
 * Fire-and-forget tool usage tracker.
 * Sends a non-blocking POST to the metrics API.
 * @param {string} tool - tool slug, e.g. "merge-pdf"
 * @param {number} count - number of files processed
 */
export function trackToolUsage(tool, count = 1) {
  if (!tool) return;
  try {
    fetch('/api/metrics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool, count }),
    }).catch(() => {});
  } catch {
    // silent — metrics should never break UX
  }
}
