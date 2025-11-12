import { useEffect, useState } from "react";

function Home() {
  const [listings, setListings] = useState([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [selectedListing, setSelectedListing] = useState(null); // ✅ for modal

  // Fetch listings with optional filters
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

  // ✅ Add to Cart function
  const handleAddToCart = async (listingId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("❌ Please log in to add items to your cart.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/carts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ listingId }),
      });

      if (res.ok) {
        setMessage("✅ Added to cart!");
        setSelectedListing(null); // ✅ Close modal after adding to cart
      } else {
        const error = await res.json();
        setMessage("❌ Error adding to cart: " + error.error);
      }
    } catch (err) {
      console.error("Error:", err);
      setMessage("❌ Something went wrong.");
    }
  };

  // ✅ Apply sorting client-side
  const sortedListings = [...listings].sort((a, b) => {
    switch (sortOption) {
      case "priceLowHigh":
        return a.price - b.price;
      case "priceHighLow":
        return b.price - a.price;
      case "titleAZ":
        return a.title.localeCompare(b.title);
      case "artistAZ":
        return a.artist.localeCompare(b.artist);
      default:
        return 0;
    }
  });

  // ✅ Close modal on Escape
  useEffect(() => {
    const handleEscape = (e) => e.key === "Escape" && setSelectedListing(null);
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <div style={{ fontFamily: "sans-serif", padding: "20px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>🎵 Record Store</h1>

      {/* Message / Status */}
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

      {/* Search + Filters + Sort */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "20px",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="Search title or artist..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            width: "200px",
          }}
        />

        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        >
          <option value="">All Genres</option>
          <option value="Rock">Rock</option>
          <option value="Pop">Pop</option>
          <option value="Jazz">Jazz</option>
          <option value="Hip Hop">Hip Hop</option>
          <option value="Classical">Classical</option>
          <option value="Electronic">Electronic</option>
          <option value="Country">Country</option>
        </select>

        <input
          type="number"
          placeholder="Min price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            width: "100px",
          }}
        />
        <input
          type="number"
          placeholder="Max price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            width: "100px",
          }}
        />

        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        >
          <option value="">Sort by</option>
          <option value="priceLowHigh">Price: Low → High</option>
          <option value="priceHighLow">Price: High → Low</option>
          <option value="titleAZ">Title: A → Z</option>
          <option value="artistAZ">Artist: A → Z</option>
        </select>
      </div>

      {/* Listings Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px",
        }}
      >
        {sortedListings.length > 0 ? (
          sortedListings.map((listing) => (
            <div
              key={listing.id}
              onClick={() => setSelectedListing(listing)}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "15px",
                backgroundColor: "#fff",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                cursor: "pointer",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
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
              <h2 style={{ fontSize: "18px", margin: "10px 0 5px" }}>{listing.title}</h2>
              <p style={{ margin: "0 0 5px", color: "#555" }}>{listing.artist}</p>
              {listing.genre && (
                <p style={{ margin: "0 0 5px", color: "#777" }}>
                  <em>{listing.genre}</em>
                </p>
              )}
              <p style={{ margin: "0 0 5px" }}>
                <strong>${listing.price}</strong>
              </p>
              <p style={{ margin: "0", fontStyle: "italic", color: "#888" }}>
                Condition: {listing.condition}
              </p>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center" }}>No listings found.</p>
        )}
      </div>

      {/* ✅ Popup Modal */}
      {selectedListing && (
        <div
          onClick={() => setSelectedListing(null)} // click background to close
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            animation: "fadeIn 0.3s ease",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "10px",
              boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
              maxWidth: "400px",
              textAlign: "center",
              animation: "slideUp 0.3s ease",
            }}
          >
            <img
              src={selectedListing.imageUrl}
              alt={selectedListing.title}
              style={{
                width: "100%",
                height: "250px",
                objectFit: "cover",
                borderRadius: "8px",
                marginBottom: "15px",
              }}
            />
            <h2>{selectedListing.title}</h2>
            <p>{selectedListing.artist}</p>
            {selectedListing.genre && <p><em>{selectedListing.genre}</em></p>}
            <p><strong>${selectedListing.price}</strong></p>
            <p>Condition: {selectedListing.condition}</p>
            <button
              onClick={() => handleAddToCart(selectedListing.id)}
              style={{
                marginTop: "10px",
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                padding: "10px 15px",
                borderRadius: "5px",
                cursor: "pointer",
                width: "100%",
              }}
            >
              Add to Cart
            </button>
            <button
              onClick={() => setSelectedListing(null)}
              style={{
                marginTop: "10px",
                backgroundColor: "#ddd",
                border: "none",
                padding: "8px 15px",
                borderRadius: "5px",
                cursor: "pointer",
                width: "100%",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ✅ Animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}

export default Home;
