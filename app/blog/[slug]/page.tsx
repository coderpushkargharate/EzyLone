"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

// ✅ Define proper TypeScript interface
interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  createdAt: string;
  updatedAt?: string;
  author?: string;
  tags?: string[];
}

// ✅ Use environment variable (matches your Contact page pattern)
const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_HOST || 'http://127.0.0.1:3001';

export default function BlogDetails() {
  const { slug } = useParams();
  const router = useRouter();
  
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ✅ Validate slug exists
    if (!slug) {
      setError('Blog slug is missing');
      setLoading(false);
      return;
    }

    const fetchBlog = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await fetch(`${API_BASE_URL}/api/blog/${slug}`, {
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (res.status === 404) {
          throw new Error('Blog not found');
        }
        
        if (!res.ok) {
          throw new Error(`Failed to fetch blog: ${res.status}`);
        }
        
        const data: BlogPost = await res.json();
        setBlog(data);
        
        // ✅ Optional: Update page title for SEO
        if (typeof document !== 'undefined') {
          document.title = `${data.title} | EzyLoan Blog`;
        }
        
      } catch (err: any) {
        console.error('Error fetching blog:', err);
        setError(err.message || 'Unable to load blog post');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  // ✅ Loading State
  if (loading) {
    return (
      <div style={{ 
        maxWidth: "800px", 
        margin: "auto", 
        padding: "20px",
        marginTop: "40px",
        textAlign: "center"
      }}>
        <Link href="/blogs" style={{ color: "#1a73e8", display: "inline-block", marginBottom: "20px" }}>
          ← Back to Blogs
        </Link>
        <div style={{ 
          width: "100%", 
          height: "300px", 
          backgroundColor: "#f3f4f6", 
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#666"
        }}>
          Loading content...
        </div>
      </div>
    );
  }

  // ✅ Error State - Blog Not Found
  if (error || !blog) {
    return (
      <div style={{ 
        maxWidth: "800px", 
        margin: "auto", 
        padding: "40px 20px",
        marginTop: "40px",
        textAlign: "center"
      }}>
        <Link href="/blogs" style={{ color: "#1a73e8", display: "inline-block", marginBottom: "20px" }}>
          ← Back to Blogs
        </Link>
        <div style={{ 
          padding: "30px",
          backgroundColor: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: "12px",
          color: "#dc2626"
        }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "10px" }}>😕 Blog Not Found</h2>
          <p>{error || "The blog post you're looking for doesn't exist or has been removed."}</p>
          <Link 
            href="/blogs" 
            style={{ 
              display: "inline-block",
              marginTop: "20px",
              padding: "10px 24px",
              backgroundColor: "#1a73e8",
              color: "white",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "500"
            }}
          >
            Browse All Blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article style={{ maxWidth: "800px", margin: "auto", padding: "20px", marginTop: "40px" }}>
      {/* Breadcrumb Navigation */}
      <nav style={{ marginBottom: "20px", fontSize: "0.9rem", color: "#666" }}>
        <Link href="/" style={{ color: "#1a73e8", textDecoration: "none" }}>Home</Link>
        <span style={{ margin: "0 8px" }}>›</span>
        <Link href="/blogs" style={{ color: "#1a73e8", textDecoration: "none" }}>Blogs</Link>
        <span style={{ margin: "0 8px" }}>›</span>
        <span style={{ color: "#333" }}>{blog.title}</span>
      </nav>

      {/* Back Link */}
      <Link 
        href="/blogs" 
        style={{ 
          color: "#1a73e8", 
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          marginBottom: "20px",
          textDecoration: "none",
          fontWeight: "500"
        }}
      >
        ← Back to Blogs
      </Link>

      {/* Featured Image */}
      <figure style={{ margin: "20px 0" }}>
        <img 
          src={blog.image}
          alt={blog.title}
          style={{
            width: "100%",
            borderRadius: "12px",
            maxHeight: "400px",
            objectFit: "cover",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
          }}
          loading="eager" // ✅ Above-the-fold image
          onError={(e) => {
            // ✅ Fallback for broken images
            (e.target as HTMLImageElement).src = "https://via.placeholder.com/800x400?text=Image+Not+Found";
          }}
        />
      </figure>

      {/* Blog Header */}
      <header style={{ marginBottom: "30px" }}>
        <h1 style={{ 
          fontSize: "2rem", 
          marginBottom: "12px",
          lineHeight: "1.3",
          color: "#1a1a1a"
        }}>
          {blog.title}
        </h1>

        <div style={{ 
          display: "flex", 
          gap: "16px", 
          color: "#666", 
          fontSize: "0.9rem",
          flexWrap: "wrap"
        }}>
          <span>📅 {new Date(blog.createdAt).toLocaleDateString("en-IN", {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</span>
          
          {blog.author && (
            <span>✍️ By {blog.author}</span>
          )}
          
          {blog.updatedAt && blog.updatedAt !== blog.createdAt && (
            <span>🔄 Updated: {new Date(blog.updatedAt).toLocaleDateString("en-IN")}</span>
          )}
        </div>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div style={{ marginTop: "16px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {blog.tags.map((tag: string, index: number) => (
              <span 
                key={index}
                style={{
                  padding: "4px 12px",
                  backgroundColor: "#e0f2fe",
                  color: "#0369a1",
                  borderRadius: "20px",
                  fontSize: "0.85rem",
                  fontWeight: "500"
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Blog Content */}
      <div
        dangerouslySetInnerHTML={{ __html: blog.content }}
        style={{ 
          lineHeight: "1.8", 
          color: "#333",
          fontSize: "1.1rem"
        }}
        className="blog-content"
      />

      {/* Share Section (Optional) */}
      <div style={{ 
        marginTop: "40px", 
        paddingTop: "20px", 
        borderTop: "1px solid #eee",
        display: "flex",
        gap: "12px",
        alignItems: "center"
      }}>
        <span style={{ color: "#666", fontSize: "0.9rem" }}>Share:</span>
        <a 
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ 
            padding: "8px 16px",
            backgroundColor: "#1da1f2",
            color: "white",
            borderRadius: "6px",
            textDecoration: "none",
            fontSize: "0.9rem",
            fontWeight: "500"
          }}
        >
          Twitter
        </a>
        <a 
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ 
            padding: "8px 16px",
            backgroundColor: "#0a66c2",
            color: "white",
            borderRadius: "6px",
            textDecoration: "none",
            fontSize: "0.9rem",
            fontWeight: "500"
          }}
        >
          LinkedIn
        </a>
      </div>

      {/* Back to Blogs Button */}
      <div style={{ marginTop: "40px", textAlign: "center" }}>
        <Link 
          href="/blogs"
          style={{
            display: "inline-block",
            padding: "12px 32px",
            backgroundColor: "#1a73e8",
            color: "white",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: "600",
            transition: "background-color 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1557b0"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#1a73e8"}
        >
          ← View All Blogs
        </Link>
      </div>

      {/* ✅ Inline Styles for Blog Content Formatting */}
      <style jsx global>{`
        .blog-content h1, .blog-content h2, .blog-content h3 {
          margin: 1.5em 0 0.8em;
          color: #1a1a1a;
          line-height: 1.4;
        }
        .blog-content h1 { font-size: 1.8rem; }
        .blog-content h2 { font-size: 1.5rem; }
        .blog-content h3 { font-size: 1.3rem; }
        
        .blog-content p {
          margin: 1em 0;
          color: #333;
        }
        
        .blog-content ul, .blog-content ol {
          margin: 1em 0;
          padding-left: 24px;
        }
        .blog-content li {
          margin: 0.5em 0;
          color: #444;
        }
        
        .blog-content a {
          color: #1a73e8;
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: border-color 0.2s;
        }
        .blog-content a:hover {
          border-bottom-color: #1a73e8;
        }
        
        .blog-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1em 0;
        }
        
        .blog-content blockquote {
          margin: 1.5em 0;
          padding: 16px 20px;
          border-left: 4px solid #1a73e8;
          background: #f8fafc;
          color: #475569;
          font-style: italic;
        }
        
        .blog-content code {
          background: #f1f5f9;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.95em;
        }
        
        .blog-content pre {
          background: #1e293b;
          color: #e2e8f0;
          padding: 16px;
          border-radius: 8px;
          overflow-x: auto;
          margin: 1.5em 0;
        }
      `}</style>
    </article>
  );
}