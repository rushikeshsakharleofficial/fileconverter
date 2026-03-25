import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer-links">
        {[['/', 'Home'], ['/tools', 'Tools'], ['/about', 'About'], ['/privacy', 'Privacy'], ['/contact', 'Contact']].map(([to, label]) => (
          <Link to={to} key={label}>{label}</Link>
        ))}
      </div>
      <p>© {new Date().getFullYear()} PixConvert. All rights reserved. Built with ❤️ — 100% client-side.</p>
    </div>
  </footer>
);

export default Footer;
