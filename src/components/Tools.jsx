import { Outlet, useLocation, Link } from 'react-router-dom';
import { useRef, useCallback } from 'react';
import { toolsData } from '../data/toolsData';

const Tilt3DCard = ({ children, to, className, style, disabled }) => {
  const ref = useRef(null);
  const rafRef = useRef(null);

  const handleMove = useCallback((e) => {
    if (disabled || rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) { rafRef.current = null; return; }
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(500px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-4px) scale3d(1.02,1.02,1.02)`;
      rafRef.current = null;
    });
  }, [disabled]);

  const handleLeave = useCallback(() => {
    const el = ref.current;
    if (el) el.style.transform = '';
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  }, []);

  return (
    <Link to={to} ref={ref} className={className}
      style={{ ...style, transformStyle: 'preserve-3d', transition: 'transform 0.25s ease-out' }}
      onMouseMove={handleMove} onMouseLeave={handleLeave}>
      {children}
    </Link>
  );
};

const Tools = () => {
  const location = useLocation();
  const isToolsHome = location.pathname === '/tools' || location.pathname === '/tools/';

  if (isToolsHome) {
    return (
      <section>
        <div className="container">
          <h2 className="section-title fade-in">All PDF &amp; Image Tools</h2>
          <p className="section-subtitle fade-in delay-1">Every tool you need, running entirely in your browser</p>

          {toolsData.map((cat, idx) => (
            <div key={idx} className={`tools-category-section fade-in delay-${Math.min(idx + 1, 9)}`}>
              <h3 className="category-heading">{cat.category}</h3>
              <div className="tool-cards-grid">
                {cat.items.map((item, i) => (
                  <Tilt3DCard
                    key={i}
                    to={item.path}
                    className={`tool-card${item.comingSoon ? ' coming-soon' : ''}`}
                    style={{ '--card-color': item.color }}
                    disabled={item.comingSoon}
                  >
                    <div className="tool-card-icon">{item.icon}</div>
                    <h3>
                      {item.name}
                      {item.isNew && <span className="badge badge-new">New</span>}
                    </h3>
                    <p>{item.desc}</p>
                    {!item.comingSoon && <span className="tool-card-cta">Use Tool →</span>}
                  </Tilt3DCard>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Individual tool page
  const allTools = toolsData.flatMap(c => c.items);
  const currentTool = allTools.find(t => location.pathname.endsWith(t.path.split('/').pop()));

  const title = currentTool
    ? `${currentTool.icon} ${currentTool.name}`
    : location.pathname.includes('gif') ? '🎞️ GIF Maker'
    : location.pathname.includes('pdf-lock') ? '🔐 PDF Locker'
    : location.pathname.includes('pdf') ? '🔓 PDF Unlocker'
    : '🔄 Universal Converter';

  const subtitle = currentTool?.desc || 'All processing happens right here in your browser — nothing is uploaded';

  return (
    <section>
      <div className="container">
        <h2 className="section-title fade-in">{title}</h2>
        <p className="section-subtitle fade-in delay-1">{subtitle}</p>
        <div className="glass fade-in delay-2" style={{ marginTop: '1rem' }}>
          <Outlet />
        </div>
      </div>
    </section>
  );
};

export default Tools;
