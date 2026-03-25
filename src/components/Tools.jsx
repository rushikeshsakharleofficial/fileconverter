import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import UniversalConverter from './UniversalConverter';
import GifMaker from './GifMaker';

const Tools = () => {
  const location = useLocation();
  const [tab, setTab] = useState(location.state?.tab || 'converter');

  return (
    <section>
      <div className="container">
        <h2 className="section-title fade-in visible">Image Tools</h2>
        <p className="section-subtitle fade-in visible">All processing happens right here in your browser — nothing is uploaded</p>
        <div className="tabs fade-in visible">
          {[
            { id: 'converter', label: '🔄 Universal Converter' },
            { id: 'gif',       label: '🎞️ GIF Maker' },
          ].map(t => (
            <button key={t.id} className={`tab-btn${tab === t.id ? ' active' : ''}`}
              onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="glass fade-in visible" style={{ marginTop: '1rem' }}>
          {tab === 'converter' && <UniversalConverter />}
          {tab === 'gif'       && <GifMaker />}
        </div>
      </div>
    </section>
  );
};

export default Tools;
