import React, { useState, useEffect } from "react";
import { fetchRestaurants } from "./api";
import "./index.css";

export default function App() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);

        // Fetch up to 500 restaurants from Oracle backend
        const rows = await fetchRestaurants({ page: 1, limit: 500 });

        if (!mounted) return;

        const mapped = (rows || []).map(r => ({
          id: r.RESTAURANT_ID || r.restaurant_id,
          name: r.NAME || r.name || "Unnamed",
          address: r.ADDRESS || r.address || "",
          city: r.CITY || r.city || "",
          avg_rating: r.AVG_RATING || r.avg_rating || 0,
          website: r.WEBSITE_URL || r.website_url || "",
          img: r.IMG || r.img || "https://via.placeholder.com/800x600" 
        }));

        setRestaurants(mapped);
      } catch (e) {
        console.error("Failed loading restaurants", e);
        setErr(e.message || String(e));
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => (mounted = false);
  }, []);

  // Loading state
  if (loading)
    return (
      <div style={{ padding: 20, fontSize: 20 }}>
        Loading restaurants…
      </div>
    );

  // Error state
  if (err)
    return (
      <div style={{ padding: 20, color: "red", fontSize: 18 }}>
        Error loading restaurants: {err}
      </div>
    );

  return (
    <div style={{ padding: 20 }}>
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20
        }}
      >
        <h1 style={{ margin: 0 }}>DineWise</h1>
        <div>
          <button
            style={{
              padding: "10px 16px",
              marginRight: 10,
              background: "#6C63FF",
              color: "#fff",
              borderRadius: 6,
              border: "none",
              cursor: "pointer"
            }}
          >
            Add Restaurant
          </button>
          <button
            style={{
              padding: "10px 16px",
              borderRadius: 6,
              border: "1px solid #aaa",
              cursor: "pointer"
            }}
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Count */}
      <div style={{ marginBottom: 10, fontSize: 18 }}>
        Showing {restaurants.length} restaurants
      </div>

      {/* Restaurant grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 20
        }}
      >
        {restaurants.map(r => (
          <div
            key={r.id}
            style={{
              border: "1px solid #eee",
              borderRadius: 10,
              background: "#fff",
              boxShadow: "0 4px 14px rgba(0,0,0,0.07)",
              overflow: "hidden"
            }}
          >
            {/* Image */}
            <div
              style={{
                height: 180,
                backgroundImage: `url(${r.img})`,
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
            />

            {/* Content */}
            <div style={{ padding: 16 }}>
              <h3 style={{ marginTop: 0 }}>{r.name}</h3>
              <div style={{ color: "#666", fontSize: 14, marginBottom: 8 }}>
                {r.address}
              </div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{r.city}</div>

              <div style={{ marginTop: 8, fontSize: 16 }}>
                ⭐ {r.avg_rating?.toFixed?.(1) ?? r.avg_rating}
              </div>

              {/* Website link */}
              {r.website ? (
                <a
                  href={r.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-block", marginTop: 10 }}
                >
                  Visit Website →
                </a>
              ) : (
                <div style={{ marginTop: 10, color: "#777" }}>
                  No website listed
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
