import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GlowingLineChart } from './ui/glowing-line-chart';

const PERIODS = [
  { key: 'daily', label: 'Day' },
  { key: 'weekly', label: 'Week' },
  { key: 'monthly', label: 'Month' },
  { key: 'yearly', label: 'Year' },
];

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
            fetchStats(period);
          }
        } catch (err) {
          console.error('SSE Error:', err);
        }
      };
    } catch {
      // silent
    }

    return () => {
      if (es) es.close();
    };
  }, [period, fetchStats]);

  // Adapt backend buckets to Recharts format
  const chartData = useMemo(() => {
    if (!stats?.buckets) return [];
    return stats.buckets.map(b => ({
      label: b.label,
      ...b.tools
    }));
  }, [stats]);

  // Generate chart config dynamically from tools present in data
  const chartConfig = useMemo(() => {
    if (!stats?.buckets) return {};
    const toolSet = new Set();
    stats.buckets.forEach(b => {
      if (b.tools) Object.keys(b.tools).forEach(t => toolSet.add(t));
    });
    
    const config = {};
    Array.from(toolSet).forEach((tool, i) => {
      config[tool] = {
        label: toolLabel(tool),
        color: `hsl(${(i * 137.5) % 360}, 70%, 50%)`,
      };
    });
    return config;
  }, [stats]);

  // Debug: log data to console
  useEffect(() => {
    if (chartData.length) {
      console.log('Analytics Chart Data:', chartData);
      console.log('Analytics Chart Config:', chartConfig);
    }
  }, [chartData, chartConfig]);

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

        <div className="fade-in visible" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="glass" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div className="analytics-periods" style={{ alignSelf: 'flex-start' }}>
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
              <span className="analytics-card-badge">
                {stats?.total?.toLocaleString() || 0} this {period === 'daily' ? 'day' : period === 'weekly' ? 'week' : period === 'monthly' ? 'month' : 'year'}
              </span>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {loading ? (
                <div className="analytics-loading">Loading chart…</div>
              ) : chartData.length ? (
                <GlowingLineChart 
                  data={chartData} 
                  config={chartConfig} 
                  title="Files Processed"
                  description={`Usage trends per ${period}`}
                  trending="Live"
                />
              ) : (
                <p className="analytics-empty">No data for this period.</p>
              )}
            </div>
          </div>

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
