import { useEffect, useState } from "react";

function Shop() {
  const [listings, setListings] = useState([]);
  const [message, setMessage] = useState("");

  // Filters
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

  // Sorting
  const sortedListings = [...listings].sort((a, b) => {
    switch (sortOption) {
      case "priceLowHigh": return a.salePrice ?? a.price - (b.salePrice ?? b.price);
      case "priceHighLow": return (b.salePrice ?? b.price) - (a.salePrice ?? a.price);
      case "titleAZ": return a.title.localeCompare(b.title);
      case "artistAZ": return a.artist.localeCompare(b.artist);
      default: return 0;
    }
  });

  const renderListingCard = (listing) => (
    <div
        key={listing.id}
        style={{
        position: "relative",
        border: "1px solid #eee",
        borderRadius: "10px",
        padding: "15px",
        textAlign: "center",
        backgroundColor: "#f9f9f9"
        }}
    >

        {/* On Sale Badge */}
        {listing.onSale && listing.salePrice && (
        <div
            style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            backgroundColor: "#ff4d4d",
            color: "#fff",
            padding: "5px 10px",
            borderRadius: "5px",
            fontSize: "0.8rem",
            fontWeight: "bold"
            }}
        >
            On Sale!
        </div>
        )}

        <div style={{ width: "100%", height: "200px", marginBottom: "15px" }}>
        <img
            src={listing.imageUrl}
            alt={listing.title}
            style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "8px"
            }}
        />
        </div>

        {/* Title + artist only */}
        <h4 style={{ margin: "5px 0" }}>{listing.title}</h4>
        <p style={{ margin: "5px 0", color: "#555" }}>{listing.artist}</p>

        <button
        onClick={() => setSelectedListing(listing)}
        style={{
            marginTop: "10px",
            padding: "8px 12px",
            backgroundColor: "#000",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
        }}
        >
        View Record
        </button>
    </div>
    );



  // ESC closes modal
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && setSelectedListing(null);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div style={{
      fontFamily: "Arial, sans-serif",
      minHeight: "100vh",
      backgroundColor: "#fff",
      color: "#000",
      padding: "20px"
    }}>
      {message && (
        <div style={{
          marginBottom: "20px",
          padding: "10px",
          background: "#f0f0f0",
          borderRadius: "5px"
        }}>
          {message}
        </div>
      )}

      {/* PAGE TITLE */}
      <h2 style={{ fontSize: "2.5rem", fontWeight: "bold", textAlign: "center", marginBottom: "30px" }}>
        Shop All Records
      </h2>

      {/* FILTER BAR */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "15px",
        marginBottom: "30px",
        justifyContent: "center"
      }}>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", minWidth: "200px" }}
        />

        <input
          type="text"
          placeholder="Genre..."
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", minWidth: "150px" }}
        />

        <input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", width: "120px" }}
        />

        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", width: "120px" }}
        />

        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
        >
          <option value="">Sort</option>
          <option value="priceLowHigh">Price: Low → High</option>
          <option value="priceHighLow">Price: High → Low</option>
          <option value="titleAZ">Title A → Z</option>
          <option value="artistAZ">Artist A → Z</option>
        </select>
      </div>

      {/* GRID OF LISTINGS */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "25px"
      }}>
        {sortedListings.length > 0 ? (
          sortedListings.map(renderListingCard)
        ) : (
          <p style={{ textAlign: "center", width: "100%" }}>No records found.</p>
        )}
      </div>

      {/* MODAL */}
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
            <img
              src={selectedListing.imageUrl}
              alt={selectedListing.title}
              style={{
                width: "100%", height: "250px",
                objectFit: "cover", borderRadius: "8px",
                marginBottom: "15px"
              }}
            />
            <h2>{selectedListing.title}</h2>
            <p>{selectedListing.artist}</p>
            {selectedListing.genre && <p><em>{selectedListing.genre}</em></p>}

            <p>
              {selectedListing.onSale && selectedListing.salePrice ? (
                <>
                  <span style={{ textDecoration: "line-through", color: "#888", marginRight: "8px" }}>
                    ${selectedListing.price}
                  </span>
                  <span>${selectedListing.salePrice}</span>
                </>
              ) : (
                <>${selectedListing.price}</>
              )}
            </p>

            <p>Condition: {selectedListing.condition}</p>

            <button
              onClick={() => handleAddToCart(selectedListing.id)}
              style={{
                marginTop: "10px", width: "100%", padding: "10px",
                backgroundColor: "#000", color: "#fff",
                border: "none", borderRadius: "5px", cursor: "pointer"
              }}
            >
              Add to Cart
            </button>

            <button
              onClick={() => setSelectedListing(null)}
              style={{
                marginTop: "10px", width: "100%", padding: "10px",
                backgroundColor: "#ddd",
                border: "none", borderRadius: "5px",
                cursor: "pointer"
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <footer style={{
        padding: "20px",
        borderTop: "1px solid #ddd",
        textAlign: "center",
        color: "#555",
        marginTop: "40px"
      }}>
        © {new Date().getFullYear()} Vinylverse. All rights reserved.
      </footer>
    </div>
  );
}

export default Shop;
