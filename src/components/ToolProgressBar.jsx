/**
 * Standard progress UI for all tools. Use `value` 0–100 for determinate progress;
 * omit `value` (or pass null) for an indeterminate (busy) bar.
 */
const ToolProgressBar = ({ active, label = 'Processing…', value, className = '', style: wrapStyle }) => {
  if (!active) return null;
  const indeterminate = value == null || Number.isNaN(Number(value));
  const pct = indeterminate ? 0 : Math.min(100, Math.max(0, Math.round(Number(value))));

  return (
    <div
      className={`tool-progress-wrap fade-in ${className}`.trim()}
      style={{ marginTop: '0.85rem', ...wrapStyle }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.8rem',
          color: 'var(--text3)',
          marginBottom: '0.35rem',
          gap: '0.5rem',
        }}
      >
        <span>{label}</span>
        {!indeterminate && <span style={{ fontVariantNumeric: 'tabular-nums' }}>{pct}%</span>}
      </div>
      <div className="progress-bar" style={{ marginTop: 0 }}>
        <div
          className={`progress-fill${indeterminate ? ' animated' : ''}`}
          style={{ width: indeterminate ? '100%' : `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default ToolProgressBar;
