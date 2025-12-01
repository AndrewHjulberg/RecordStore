import { useEffect, useState } from "react";

function Home() {
  const [listings, setListings] = useState([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [selectedListing, setSelectedListing] = useState(null);

  const fetchListings = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (genre) params.append("genre", genre);
      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);

      const res = await fetch(`http://localhost:5000/listings?${params.toString()}`);
      const data = await res.json();
      setListings(data);
    } catch (err) {
      console.error("Error fetching listings:", err);
      setMessage("❌ Failed to load listings.");
    }
  };

  useEffect(() => {
    fetchListings();
  }, [search, genre, minPrice, maxPrice]);

  const handleAddToCart = async (listingId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("❌ Please log in to add items to your cart.");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/carts", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ listingId }),
      });
      if (res.ok) {
        setMessage("✅ Added to cart!");
        setSelectedListing(null);
      } else {
        const error = await res.json();
        setMessage("❌ Error adding to cart: " + error.error);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Something went wrong.");
    }
  };

  const sortedListings = [...listings].sort((a, b) => {
    switch (sortOption) {
      case "priceLowHigh": return a.price - b.price;
      case "priceHighLow": return b.price - a.price;
      case "titleAZ": return a.title.localeCompare(b.title);
      case "artistAZ": return a.artist.localeCompare(b.artist);
      default: return 0;
    }
  });

  const featuredListings = sortedListings.filter(l => l.featured).slice(0, 4);
  const onSaleListings = sortedListings.filter(l => l.onSale).slice(0, 4);

  useEffect(() => {
    const handleEscape = (e) => e.key === "Escape" && setSelectedListing(null);
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const renderListingCard = (listing, isOnSale = false) => (
    <div key={listing.id} style={{
      border: "1px solid #eee", borderRadius: "10px", padding: "15px",
      textAlign: "center", backgroundColor: "#f9f9f9"
    }}>
      <div style={{ width: "100%", height: "200px", marginBottom: "15px" }}>
        <img 
          src={listing.imageUrl} 
          alt={listing.title} 
          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }} 
        />
      </div>

      {/* Only show title + artist */}
      <h4 style={{ margin: "5px 0" }}>{listing.title}</h4>
      <p style={{ margin: "5px 0", color: "#555" }}>{listing.artist}</p>

      {/* View button only */}
      <button
        onClick={() => setSelectedListing(listing)}
        style={{ 
          marginTop: "10px", padding: "8px 12px", 
          backgroundColor: "#000", color: "#fff", 
          border: "none", borderRadius: "5px", cursor: "pointer" 
        }}
      >
        View Record
      </button>
    </div>
  );


  return (
    <div style={{ fontFamily: "Arial, sans-serif", minHeight: "100vh", backgroundColor: "#fff", color: "#000", padding: "20px" }}>
      {message && (
        <div style={{ marginBottom: "20px", padding: "10px", background: "#f0f0f0", borderRadius: "5px" }}>
          {message}
        </div>
      )}

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "40px 20px" }}>
        <h2 style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "20px" }}>
          Explore the Sound of Time
        </h2>
        <p style={{ maxWidth: "600px", margin: "0 auto 20px", color: "#555" }}>
          Discover handpicked vintage records from across the globe. Every spin tells a story.
        </p>
        <div style={{ textAlign: "center", marginTop: "25px" }}>
          <button
            onClick={() => window.location.href = "/shop"}
            style={{
              padding: "12px 22px",
              backgroundColor: "#000",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontSize: "1rem",
              cursor: "pointer"
            }}
          >
            Browse All Records
          </button>
        </div>

      </section>

      {/* Featured Finds */}
      <section style={{ padding: "40px 0" }}>
        <h3 style={{ fontSize: "2rem", textAlign: "center", marginBottom: "40px" }}>Featured Finds</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "25px" }}>
          {featuredListings.length > 0 ? featuredListings.map(renderListingCard) : <p style={{ textAlign: "center" }}>No featured listings.</p>}
        </div>
      </section>

      {/* On Sale */}
      <section style={{ padding: "40px 0" }}>
        <h3 style={{ fontSize: "2rem", textAlign: "center", marginBottom: "40px" }}>On Sale</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "25px" }}>
          {onSaleListings.length > 0 ? onSaleListings.map(listing => renderListingCard(listing, true)) : <p style={{ textAlign: "center" }}>No on sale listings.</p>}
        </div>
      </section>

      {/* Modal */}
      {selectedListing && (
        <div
          onClick={() => setSelectedListing(null)}
          style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
            backgroundColor: "rgba(0,0,0,0.6)", display: "flex",
            justifyContent: "center", alignItems: "center", zIndex: 1000
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#fff", padding: "30px", borderRadius: "10px",
              maxWidth: "400px", width: "90%", textAlign: "center"
            }}
          >
            <img src={selectedListing.imageUrl} alt={selectedListing.title}
              style={{ width: "100%", height: "250px", objectFit: "cover", borderRadius: "8px", marginBottom: "15px" }} />
            <h2>{selectedListing.title}</h2>
            <p>{selectedListing.artist}</p>
            {selectedListing.genre && <p><em>{selectedListing.genre}</em></p>}
            <p>
              {selectedListing.onSale && selectedListing.salePrice
                ? <>
                    <span style={{ textDecoration: "line-through", color: "#888", marginRight: "8px" }}>${selectedListing.price}</span>
                    <span>${selectedListing.salePrice}</span>
                  </>
                : <>${selectedListing.price}</>
              }
            </p>
            <p>Condition: {selectedListing.condition}</p>
            <button
              onClick={() => handleAddToCart(selectedListing.id)}
              style={{ marginTop: "10px", width: "100%", padding: "10px", backgroundColor: "#000", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}
            >
              Add to Cart
            </button>
            <button
              onClick={() => setSelectedListing(null)}
              style={{ marginTop: "10px", width: "100%", padding: "10px", backgroundColor: "#ddd", border: "none", borderRadius: "5px", cursor: "pointer" }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ padding: "20px", borderTop: "1px solid #ddd", textAlign: "center", color: "#555", marginTop: "40px" }}>
        © {new Date().getFullYear()} Vinylverse. All rights reserved.
      </footer>
    </div>
  );
}

export default Home;
