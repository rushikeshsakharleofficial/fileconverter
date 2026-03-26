import { Link } from 'react-router-dom';
import { toolsData } from '../data/toolsData';

const Home = () => (
  <section className="hero">
    <div className="container fade-in visible">
      <h1>Convert Images & Edit PDFs Instantly.<br/><span className="accent">Free. Private.</span></h1>
      <p>All processing happens in your browser. No uploads, no servers, no tracking. Your files never leave your device.</p>
      <div className="hero-cta">
        <Link to="/tools" className="btn btn-primary">🚀 Explore All Tools</Link>
        <Link to="/about" className="btn btn-outline">Learn More</Link>
      </div>
    </div>

    <div className="container">
      <div className="tools-directory" style={{ marginTop: '3rem' }}>
        {toolsData.map((cat, idx) => (
          <div className="glass feature-card fade-in visible" key={idx} style={{ textAlign: 'left' }}>
            <h3 style={{ fontFamily: 'var(--heading)', marginBottom: '.75rem', borderBottom: '2px solid rgba(252,94,2,.15)', paddingBottom: '.5rem' }}>{cat.category}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
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

      <div className="trust-strip fade-in visible">
        {['No Sign-up Required', 'No File Size Limit', 'Works Offline', 'Open Source Friendly', 'Zero Data Collection'].map((t, i) => (
          <div className="trust-item" key={i}><span className="dot"/> {t}</div>
        ))}
      </div>

      <div className="how-it-works fade-in visible">
        <h2>How It Works</h2>
        <div className="steps">
          {[
            { n: '1', title: 'Upload', desc: 'Drag & drop or click to select your files' },
            { n: '2', title: 'Choose Tool', desc: 'Pick your desired tool and settings' },
            { n: '3', title: 'Download', desc: 'Get your processed files instantly — no waiting' }
          ].map((s, i) => (
            <div className="step" key={i}>
              <div className="step-num">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default Home;
