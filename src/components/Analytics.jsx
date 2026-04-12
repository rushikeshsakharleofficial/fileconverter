import { useState, useEffect, useRef, useCallback } from 'react';

const PERIODS = [
  { key: 'daily', label: 'Day' },
  { key: 'weekly', label: 'Week' },
  { key: 'monthly', label: 'Month' },
  { key: 'yearly', label: 'Year' },
];

// Friendly tool names
const TOOL_LABELS = {
  'converter': 'Universal Converter',
  'gif': 'GIF Maker',
  'merge-pdf': 'Merge PDF',
  'split-pdf': 'Split PDF',
  'pdf': 'Unlock PDF',
  'pdf-lock': 'Protect PDF',
  'pdf-to-jpg': 'PDF to JPG',
  'pdf-to-word': 'PDF to Word',
  'pdf-to-powerpoint': 'PDF to PowerPoint',
  'pdf-to-excel': 'PDF to Excel',
  'pdf-to-pdf-a': 'PDF to PDF/A',
  'jpg-to-pdf': 'JPG to PDF',
  'word-to-pdf': 'Word to PDF',
  'powerpoint-to-pdf': 'PowerPoint to PDF',
  'excel-to-pdf': 'Excel to PDF',
  'html-to-pdf': 'HTML to PDF',
  'rotate-pdf': 'Rotate PDF',
  'add-page-numbers': 'Add Page Numbers',
  'add-watermark': 'Add Watermark',
  'crop-pdf': 'Crop PDF',
  'edit-pdf': 'Edit PDF',
  'sign-pdf': 'Sign PDF',
  'redact-pdf': 'Redact PDF',
  'compare-pdf': 'Compare PDF',
  'remove-pages': 'Remove Pages',
  'extract-pages': 'Extract Pages',
  'organize-pdf': 'Organize PDF',
  'scan-to-pdf': 'Scan to PDF',
  'jpg-to-png': 'JPG to PNG',
  'png-to-jpg': 'PNG to JPG',
  'webp-to-jpg': 'WebP to JPG',
  'heic-to-jpg': 'HEIC to JPG',
  'bmp-to-png': 'BMP to PNG',
  'photo-to-markdown': 'Photo to Markdown',
  'ocr-pdf': 'OCR PDF',
  'compress-pdf': 'Compress PDF',
  'repair-pdf': 'Repair PDF',
};

const toolLabel = (slug) => TOOL_LABELS[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

// ─── SVG Line Chart ───
const LineChart = ({ buckets }) => {
  const max = Math.max(...buckets.map(b => b.count), 1);
  const w = 720, h = 260, pad = { top: 20, right: 24, bottom: 52, left: 44 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;
  const spacing = buckets.length > 1 ? chartW / (buckets.length - 1) : chartW;
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // Y-axis ticks
  const yTicks = [0, Math.round(max * 0.25), Math.round(max * 0.5), Math.round(max * 0.75), max];

  // Calculate points
  const points = buckets.map((b, i) => {
    const x = pad.left + i * spacing;
    const y = pad.top + chartH - (b.count / max) * chartH;
    return { x, y, b, i };
  });

  const linePath = points.map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`)).join(' ');
  const areaPath = points.length > 0 ? `${linePath} L ${points[points.length - 1].x},${pad.top + chartH} L ${points[0].x},${pad.top + chartH} Z` : '';

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="analytics-chart-svg">
      {/* Defs for gradients */}
      <defs>
        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yTicks.map((t, i) => {
        const y = pad.top + chartH - (t / max) * chartH;
        return (
          <g key={i}>
            <line x1={pad.left} x2={w - pad.right} y1={y} y2={y}
              stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
            <text x={pad.left - 8} y={y + 4} textAnchor="end"
              className="chart-axis-text">{t}</text>
          </g>
        );
      })}

      {/* Area & Line */}
      {points.length > 0 && (
        <>
          <path d={areaPath} fill="url(#areaGradient)" />
          <path d={linePath} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}

      {/* Points & Interactive Zones */}
      {points.map((p, i) => {
        const isHovered = hoveredIdx === i;
        const hitWidth = spacing;
        const hitX = p.x - spacing / 2;

        return (
          <g key={i}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            {/* Invisible hover area for easier interaction */}
            <rect x={Math.max(pad.left, hitX)} y={pad.top} width={Math.min(hitWidth, w - pad.right)} height={chartH} fill="transparent" style={{ cursor: 'crosshair' }} />
            
            {/* Point */}
            <circle cx={p.x} cy={p.y} r={isHovered ? 6 : 4} fill={isHovered ? 'var(--bg)' : 'var(--primary)'} stroke="var(--primary)" strokeWidth="3" style={{ transition: 'r 0.15s, fill 0.15s' }} />
            
            {/* Hover guideline */}
            {isHovered && (
              <line x1={p.x} x2={p.x} y1={p.y + 6} y2={pad.top + chartH} stroke="var(--primary)" strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
            )}

            {/* Hover tooltip */}
            {isHovered && (
              <g>
                <rect x={p.x - 20} y={p.y - 32} width={40} height={20}
                  rx={4} fill="var(--bg)" stroke="var(--border)" strokeWidth={1} style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }} />
                <text x={p.x} y={p.y - 18} textAnchor="middle" fill="var(--text)" style={{ fontSize: '11px', fontWeight: 'bold' }}>{p.b.count}</text>
              </g>
            )}

            {/* X-axis label */}
            {(buckets.length <= 12 || i % Math.ceil(buckets.length / 12) === 0) && (
              <text x={p.x} y={h - pad.bottom + 16}
                textAnchor="middle" className="chart-axis-text"
                transform={`rotate(-35, ${p.x}, ${h - pad.bottom + 16})`}>
                {p.b.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

// ─── Top Tools List ───
const TopToolsList = ({ tools }) => {
  if (!tools.length) {
    return <p className="analytics-empty">No usage data yet. Process some files to see stats!</p>;
  }
  const maxCount = tools[0]?.count || 1;

  return (
    <div className="top-tools-list">
      {tools.map((t, i) => (
        <div key={t.tool} className="top-tool-row">
          <span className="top-tool-rank">#{i + 1}</span>
          <span className="top-tool-name">{toolLabel(t.tool)}</span>
          <div className="top-tool-bar-wrap">
            <div className="top-tool-bar"
              style={{ width: `${(t.count / maxCount) * 100}%` }} />
          </div>
          <span className="top-tool-count">{t.count.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Main Analytics Page ───
const Analytics = () => {
  const [period, setPeriod] = useState('monthly');
  const [stats, setStats] = useState(null);
  const [liveTotal, setLiveTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const esRef = useRef(null);

  const fetchStats = useCallback(async (p) => {
    try {
      const res = await fetch(`/api/metrics/stats?period=${p}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        setLiveTotal(data.totalAllTime);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchStats(period);
  }, [period, fetchStats]);

  // SSE for live updates
  useEffect(() => {
    let es;
    try {
      es = new EventSource('/api/metrics/stream');
      esRef.current = es;

      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (typeof data.totalAllTime === 'number') {
            setLiveTotal(data.totalAllTime);
          }
          if (data.type === 'new_event') {
            // Refetch stats on new events to update the chart
            fetchStats(period);
          }
        } catch (err) {
          console.error('SSE Error:', err);
        }
      };

      es.onerror = () => {
        // Auto-reconnect is built into EventSource
      };
    } catch {
      // SSE not supported or server not running
    }

    return () => {
      if (es) es.close();
    };
  }, [period, fetchStats]);

  return (
    <section>
      <div className="container" style={{ maxWidth: '1000px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
          <div>
            <h2 className="section-title fade-in visible" style={{ textAlign: 'left', marginBottom: '0.2rem', marginLeft: 0 }}>Analytics</h2>
            <p className="section-subtitle fade-in visible" style={{ textAlign: 'left', margin: 0 }}>Real-time file processing metrics</p>
          </div>
          <div className="analytics-live-badge">
            <span className="live-dot" />
            <span className="live-count">{liveTotal.toLocaleString()}</span>
            <span className="live-label">files processed</span>
          </div>
        </div>

        <div className="contact-grid fade-in visible">
          
          {/* Left Column: Chart */}
          <div className="glass" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ fontFamily: 'var(--heading)', color: 'var(--text)', margin: 0, fontSize: '1.35rem', fontWeight: '800' }}>
                Files Processed
              </h3>
              <span className="analytics-card-badge">
                {stats?.total?.toLocaleString() || 0} this {period === 'daily' ? 'day' : period === 'weekly' ? 'week' : period === 'monthly' ? 'month' : 'year'}
              </span>
            </div>
            
            <div className="analytics-periods" style={{ marginBottom: '1.5rem', alignSelf: 'flex-start' }}>
              {PERIODS.map(p => (
                <button
                  key={p.key}
                  className={`period-btn${period === p.key ? ' active' : ''}`}
                  onClick={() => setPeriod(p.key)}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {loading ? (
                <div className="analytics-loading">Loading chart…</div>
              ) : stats?.buckets?.length ? (
                <LineChart buckets={stats.buckets} />
              ) : (
                <p className="analytics-empty">No data for this period.</p>
              )}
            </div>
          </div>

          {/* Right Column: Top Tools */}
          <div className="glass" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontFamily: 'var(--heading)', color: 'var(--text)', marginBottom: '1.5rem', fontSize: '1.35rem', fontWeight: '800' }}>
              Top Tools
            </h3>
            <div style={{ flex: 1 }}>
              {loading ? (
                <div className="analytics-loading">Loading…</div>
              ) : (
                <TopToolsList tools={stats?.topTools || []} />
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Analytics;
