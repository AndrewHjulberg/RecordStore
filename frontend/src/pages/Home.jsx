import { useEffect, useState } from "react";

function Home() {
  const [listings, setListings] = useState([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortOption, setSortOption] = useState(""); // ✅ new

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

        {/* ✅ Sort dropdown */}
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

      {/* Listings grid */}
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
              {listing.genre && (
                <p style={{ margin: "0 0 5px", color: "#777" }}>
                  <em>{listing.genre}</em>
                </p>
              )}
              <p style={{ margin: "0 0 5px" }}>
                <strong>${listing.price}</strong>
              </p>
              <p style={{ margin: "0 0 10px", fontStyle: "italic", color: "#888" }}>
                Condition: {listing.condition}
              </p>
              <button
                onClick={() => handleAddToCart(listing.id)}
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
                Add to Cart
              </button>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center" }}>No listings found.</p>
        )}
      </div>
    </div>
  );
}

export default Home;
