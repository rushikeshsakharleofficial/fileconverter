import { Outlet, useLocation, Link } from 'react-router-dom';
import { toolsData } from '../data/toolsData';

const Tools = () => {
  const location = useLocation();
  const isToolsHome = location.pathname === '/tools' || location.pathname === '/tools/';

  if (isToolsHome) {
    return (
      <section>
        <div className="container">
          <h2 className="section-title fade-in visible">🛠️ All Tools Directory</h2>
          <p className="section-subtitle fade-in visible">Explore our complete collection of free, private, browser-based tools</p>
          
          <div className="tools-directory fade-in visible">
            {toolsData.map((cat, idx) => (
              <div key={idx} className="tools-category-card glass">
                <h3>{cat.category}</h3>
                <div className="tools-category-links">
                  {cat.items.map((item, i) => (
                    <Link key={i} to={item.path} className="tool-link-item">
                      <span className="tool-icon">{item.icon}</span>
                      <span className="tool-name">{item.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="container">
        <h2 className="section-title fade-in visible">
          {location.pathname.includes('gif') ? '🎞️ GIF Maker' : 
           location.pathname.includes('pdf-lock') ? '🔐 PDF Locker' :
           location.pathname.includes('pdf') ? '🔓 PDF Unlocker' : 
           '🔄 Universal Converter'}
        </h2>
        <p className="section-subtitle fade-in visible">All processing happens right here in your browser — nothing is uploaded</p>
        <div className="glass fade-in visible" style={{ marginTop: '1rem' }}>
          <Outlet />
        </div>
      </div>
    </section>
  );
};

export default Tools;
