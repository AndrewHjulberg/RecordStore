// src/pages/Home.jsx
import { useEffect, useState } from "react";

function Home() {
  const [listings, setListings] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/listings")
      .then((res) => res.json())
      .then((data) => setListings(data))
      .catch((err) => console.error("Error fetching listings:", err));
  }, []);

  const handleBuy = async (listingId) => {
    try {
      const res = await fetch("http://localhost:5000/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingId,
          userId: 1, // temp until JWT auth
        }),
      });

      if (res.ok) {
        setMessage("✅ Order placed successfully!");
      } else {
        const error = await res.json();
        setMessage("❌ Error placing order: " + error.error);
      }
    } catch (err) {
      console.error("Error:", err);
      setMessage("❌ Something went wrong.");
    }
  };

  return (
    <div style={{ fontFamily: "sans-serif", padding: "20px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>🎵 Record Store</h1>

      {message && (
        <div
          style={{
            marginBottom: "20px",
            padding: "10px",
            background: "#f0f0f0",
            borderRadius: "5px",
          }}
        >
          {message}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px",
        }}
      >
        {listings.map((listing) => (
          <div
            key={listing.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "15px",
              backgroundColor: "#fff",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            }}
          >
            <img
              src={listing.imageUrl}
              alt={listing.title}
              style={{
                width: "100%",
                height: "200px",
                objectFit: "cover",
                borderRadius: "5px",
              }}
            />
            <h2 style={{ fontSize: "18px", margin: "10px 0 5px" }}>
              {listing.title}
            </h2>
            <p style={{ margin: "0 0 5px", color: "#555" }}>{listing.artist}</p>
            <p style={{ margin: "0 0 5px" }}>
              <strong>${listing.price}</strong>
            </p>
            <p style={{ margin: "0 0 10px", fontStyle: "italic", color: "#888" }}>
              Condition: {listing.condition}
            </p>
            <button
              onClick={() => handleBuy(listing.id)}
              style={{
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                padding: "10px 15px",
                borderRadius: "5px",
                cursor: "pointer",
                width: "100%",
              }}
            >
              Buy Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
