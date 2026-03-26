import React from "react";
import { Link } from "react-router-dom";
import { blogData } from "../data/blogData";

const Blog = () => {
  return (
    <section className="blog-section">
      <div className="container">
        <h2 className="section-title fade-in visible">PixConvert Blog</h2>
        <p className="section-subtitle fade-in visible">Expert guides and tips for all your file conversion needs</p>
        
        <div className="tool-cards-grid">
          {blogData.map((post) => (
            <Link key={post.id} to={`/blog/${post.id}`} className="tool-card" style={{ '--card-color': 'var(--teal)' }}>
              <div className="tool-card-icon">📝</div>
              <h3>{post.title}</h3>
              <p>{post.summary}</p>
              <div className="mt-auto pt-3 text-sm font-semibold" style={{ color: 'var(--teal)' }}>Read More →</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blog;
