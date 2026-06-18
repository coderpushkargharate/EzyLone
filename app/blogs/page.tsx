"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  image: string;
  createdAt: string;
}

export default function Blogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/blogs', {
          cache: 'no-store', // ✅ Prevents stale data in production
          next: { revalidate: 3600 } // ✅ Optional: ISR revalidation every 1 hour
        });
        
        if (!res.ok) {
          throw new Error(`Failed to fetch blogs: ${res.status}`);
        }
        
        const data = await res.json();
        setBlogs(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching blogs:', err);
        setError('Unable to load blogs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // ✅ Loading State
  if (loading) {
    return (
      <div style={{ padding: "40px", maxWidth: "1100px", margin: "0 auto", textAlign: "center" }}>
        <h1 style={{ fontSize: "2.2rem", marginBottom: "30px" }}>📝 Blogs</h1>
        <p>Loading blogs...</p>
      </div>
    );
  }

  // ✅ Error State
  if (error) {
    return (
      <div style={{ padding: "40px", maxWidth: "1100px", margin: "0 auto", textAlign: "center" }}>
        <h1 style={{ fontSize: "2.2rem", marginBottom: "30px" }}>📝 Blogs</h1>
        <p style={{ color: "#dc2626" }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", maxWidth: "1100px", margin: "0 auto" }}>
      <h1 className="mt-20" style={{ 
        fontSize: "2.2rem", 
        marginBottom: "30px",
        textAlign: "center"
      }}>
        📝 Blogs
      </h1>

      {blogs.length === 0 ? (
        <p style={{ textAlign: "center", color: "#666" }}>No blogs found.</p>
      ) : (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "25px"
        }}>
          {blogs.map((b) => (
            <Link 
              href={`/blog/${b.slug}`} 
              key={b._id}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="glass-prism bg-white rounded-2xl overflow-hidden h-full">
                {/* IMAGE */}
                <img 
                  src={b.image} 
                  alt={b.title}
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover"
                  }}
                  loading="lazy" // ✅ Better performance
                />

                {/* CONTENT */}
                <div style={{ padding: "16px" }}>
                  <h2 style={{ 
                    fontSize: "1.2rem", 
                    marginBottom: "10px",
                    color: "#1a73e8"
                  }}>
                    {b.title}
                  </h2>

                  <p style={{ 
                    color: "#555", 
                    fontSize: "0.95rem",
                    marginBottom: "10px",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden"
                  }}>
                    {b.excerpt}
                  </p>

                  <span style={{ 
                    fontSize: "0.8rem",
                    color: "#999"
                  }}>
                    📅 {new Date(b.createdAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}