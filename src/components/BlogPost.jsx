import React from "react";
import { useParams, Link } from "react-router-dom";
import { blogData } from "../data/blogData";

const BlogPost = () => {
  const { id } = useParams();
  const post = blogData.find((post) => post.id === parseInt(id));

  if (!post) {
    return (
      <section className="tool-section">
        <div className="container text-center">
          <h2 className="section-title">Post not found</h2>
          <Link to="/blog" className="btn btn-primary mt-4">Back to Blog</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="blog-post-section">
      <div className="container">
        <div className="mb-4">
          <Link to="/blog" style={{ color: 'var(--teal)', fontWeight: 600, textDecoration: 'none' }}>← Back to Blog</Link>
        </div>
        <h1 className="section-title text-left mb-2" style={{ textAlign: 'left', margin: '0 0 1rem 0' }}>{post.title}</h1>
        <p className="text-muted mb-5" style={{ color: 'var(--text2)', fontStyle: 'italic' }}>{post.summary}</p>
        
        <div className="glass p-5 fade-in visible" style={{ lineHeight: '1.8' }}>
          <div className="prose" style={{ color: 'var(--text)' }}>
            {post.content.split('\n').map((line, i) => (
              <p key={i} className="mb-3">{line}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogPost;
