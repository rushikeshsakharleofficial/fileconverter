import { Link } from 'react-router-dom';

const Privacy = () => (
  <section>
    <div className="container">
      <h2 className="section-title fade-in visible">Privacy Policy</h2>
      <p className="section-subtitle fade-in visible">Last updated: March 2026</p>
      <div className="glass content-card fade-in visible">
        <div className="tldr-box">
          <h3>TL;DR</h3>
          <p>We collect nothing. Period.</p>
        </div>

        <h3>📋 What Data We Collect</h3>
        <p><strong style={{ color: 'var(--teal)' }}>None.</strong> PixConvert does not collect, store, process,
          or transmit any personal data or files. Your images are processed entirely within your browser
          using the Canvas API and JavaScript. No data ever leaves your device.</p>

        <h3>🍪 Cookies</h3>
        <p>PixConvert does not use cookies. Not first-party, not third-party, not analytics cookies,
          not tracking cookies. Zero cookies.</p>

        <h3>📊 Analytics &amp; Tracking</h3>
        <p>We do not use Google Analytics, Facebook Pixel, or any other tracking or analytics service.
          We have no interest in tracking your behavior.</p>

        <h3>🔗 Third-Party Services</h3>
        <p>PixConvert loads the following CDN resources to function:</p>
        <ul>
          <li>gif.js worker (from cdnjs.cloudflare.com) — used only when generating GIFs</li>
          <li>Google Fonts (Space Grotesk &amp; DM Sans)</li>
        </ul>
        <p>These CDNs may log standard access information (IP address, user agent) as part of their own
          services. We have no control over or access to this data. No other third-party services are used.</p>

        <h3>🖼️ Your Images</h3>
        <p>Your images never leave your device. All conversion happens using the browser's Canvas API and
          FileReader. Files are read into memory, processed, and the output is created as a Blob URL —
          entirely in JavaScript running on your machine.</p>

        <h3>👤 Children's Privacy</h3>
        <p>Since we collect no data whatsoever, there are no special provisions needed.
          PixConvert is safe for users of all ages.</p>

        <h3>📬 Contact</h3>
        <p>If you have questions about this privacy policy, use the{' '}
          <Link to="/contact" style={{ color: 'var(--teal)' }}>Contact form</Link>.
        </p>
      </div>
    </div>
  </section>
);

export default Privacy;
