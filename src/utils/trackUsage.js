const STORAGE_KEY = 'pixconvert.metrics.v1';
const TWO_YEARS_MS = 2 * 365.25 * 24 * 60 * 60 * 1000;
const MAX_LOCAL_EVENTS = 5000;

const ranges = {
  daily: 24 * 60 * 60 * 1000,
  weekly: 7 * 24 * 60 * 60 * 1000,
  monthly: 30 * 24 * 60 * 60 * 1000,
  yearly: 365 * 24 * 60 * 60 * 1000,
};

function readLocalEvents() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(raw) ? raw.filter((e) => e?.tool && Number.isFinite(e.ts)) : [];
  } catch {
    return [];
  }
}

function writeLocalEvents(events) {
  if (typeof window === 'undefined') return;
  const cutoff = Date.now() - TWO_YEARS_MS;
  const clean = events
    .filter((e) => e.ts >= cutoff)
    .slice(-MAX_LOCAL_EVENTS);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
}

function bucketLabel(start, period) {
  return new Date(start).toLocaleDateString('en-US', period === 'daily'
    ? { hour: '2-digit' }
    : period === 'yearly'
      ? { month: 'short' }
      : { month: 'short', day: 'numeric' });
}

export function getLocalUsageStats(period = 'monthly') {
  const now = Date.now();
  const events = readLocalEvents();
  const range = ranges[period] || ranges.monthly;
  const cutoff = now - range;
  const filtered = events.filter((e) => e.ts >= cutoff);

  let bucketMs;
  let bucketCount;
  if (period === 'daily') {
    bucketMs = 60 * 60 * 1000;
    bucketCount = 24;
  } else if (period === 'weekly') {
    bucketMs = 24 * 60 * 60 * 1000;
    bucketCount = 7;
  } else if (period === 'monthly') {
    bucketMs = 24 * 60 * 60 * 1000;
    bucketCount = 30;
  } else {
    bucketMs = 30 * 24 * 60 * 60 * 1000;
    bucketCount = 12;
  }

  const buckets = Array.from({ length: bucketCount }, (_, i) => {
    const start = now - (bucketCount - i) * bucketMs;
    const end = start + bucketMs;
    const bucketEvents = filtered.filter((e) => e.ts >= start && (i === bucketCount - 1 ? e.ts <= end : e.ts < end));
    const tools = {};
    bucketEvents.forEach((e) => {
      tools[e.tool] = (tools[e.tool] || 0) + 1;
    });
    return { label: bucketLabel(start, period), count: bucketEvents.length, tools };
  });

  const toolCounts = {};
  filtered.forEach((e) => {
    toolCounts[e.tool] = (toolCounts[e.tool] || 0) + 1;
  });

  const topTools = Object.entries(toolCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tool, count]) => ({ tool, count }));

  return {
    period,
    total: filtered.length,
    totalAllTime: events.length,
    buckets,
    topTools,
    source: 'local',
  };
}

/**
 * Fire-and-forget tool usage tracker.
 * Stores local stats and also posts to the metrics API when it exists.
 * @param {string} tool - tool slug, e.g. "merge-pdf"
 * @param {number} count - number of files processed
 */
export function trackToolUsage(tool, count = 1) {
  if (!tool) return;
  const normalizedTool = String(tool).toLowerCase().trim();
  const safeCount = Math.max(1, Math.min(10, Number(count) || 1));

  try {
    const now = Date.now();
    const existing = readLocalEvents();
    for (let i = 0; i < safeCount; i += 1) {
      existing.push({ tool: normalizedTool, ts: now });
    }
    writeLocalEvents(existing);
    window.dispatchEvent(new CustomEvent('pixconvert:metrics-updated'));
  } catch {
    // silent — metrics should never break UX
  }

  try {
    fetch('/api/metrics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: normalizedTool, count: safeCount }),
    }).catch(() => {});
  } catch {
    // silent — metrics should never break UX
  }
}
