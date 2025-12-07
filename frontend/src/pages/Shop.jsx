import { useEffect, useState } from "react";
import ListingImage  from "../helpers/ListingImage";

function Shop() {
  const [listings, setListings] = useState([]);
  const [message, setMessage] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");

  // ⭐ Single selected decade
  const [decade, setDecade] = useState("");

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [sortOption, setSortOption] = useState("");

  const [selectedListing, setSelectedListing] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const listingsPerPage = 12;

  const GENRES = [
    "Rock", "Pop", "Hip-Hop", "Jazz", "Electronic", "Metal", "Country",
    "Classical", "R&B", "Folk", "Reggae", "Soundtrack"
  ];

  const DECADES = [
    { label: "1950s", start: 1950, end: 1959 },
    { label: "1960s", start: 1960, end: 1969 },
    { label: "1970s", start: 1970, end: 1979 },
    { label: "1980s", start: 1980, end: 1989 },
    { label: "1990s", start: 1990, end: 1999 },
    { label: "2000s", start: 2000, end: 2009 },
    { label: "2010s", start: 2010, end: 2019 },
    { label: "2020s", start: 2020, end: 2029 }
  ];

  const fetchListings = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (genre) params.append("genre", genre);
      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);
      if (decade) params.append("decade", decade);

      const res = await fetch(`http://localhost:5000/listings?${params.toString()}`);
      const data = await res.json();
      setListings(data);
      setCurrentPage(1);
    } catch (err) {
      console.error("Error fetching listings:", err);
      setMessage("❌ Failed to load listings.");
    }
  };

  useEffect(() => {
    fetchListings();
  }, [search, genre, minPrice, maxPrice, decade]);

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

  // ⭐ Apply decade filter (corrected)
  const applyDecadeFilter = (items) => {
    if (!decade) return items;

    const selected = DECADES.find((d) => d.label === decade);
    if (!selected) return items;

    return items.filter((item) => {
      if (!item.releaseYear) return false;
      return item.releaseYear >= selected.start && item.releaseYear <= selected.end;
    });
  };

  // ⭐ Sorting (with release year sorting)
  const sortedListings = applyDecadeFilter([...listings]).sort((a, b) => {
    switch (sortOption) {
      case "priceLowHigh":
        return (a.salePrice ?? a.price) - (b.salePrice ?? b.price);
      case "priceHighLow":
        return (b.salePrice ?? b.price) - (a.salePrice ?? a.price);
      case "titleAZ":
        return a.title.localeCompare(b.title);
      case "artistAZ":
        return a.artist.localeCompare(b.artist);
      case "yearNewest":
        return (b.releaseYear ?? 0) - (a.releaseYear ?? 0);
      case "yearOldest":
        return (a.releaseYear ?? 0) - (b.releaseYear ?? 0);
      default:
        return 0;
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedListings.length / listingsPerPage);
  const startIndex = (currentPage - 1) * listingsPerPage;
  const paginatedListings = sortedListings.slice(startIndex, startIndex + listingsPerPage);

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

      <div style={{ position: "relative", width: "100%", height: "200px", marginBottom: "15px" }}>
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

        {/* Watermark overlay */}
        <span
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) rotate(-20deg)",
            color: "rgba(255,255,255,0.6)",
            fontSize: "1.2rem",
            fontWeight: "bold",
            pointerEvents: "none"
          }}
        >
          Stock Photo
        </span>
      </div>      
      <h4>{listing.title}</h4>
      <p style={{ color: "#555" }}>{listing.artist}</p>

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

  // Close modal with ESC
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && setSelectedListing(null);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div style={{ padding: "20px" }}>

      {message && (
        <div style={{ marginBottom: "20px", padding: "10px", background: "#f0f0f0", borderRadius: "5px" }}>
          {message}
        </div>
      )}

      <h2 style={{ fontSize: "2.5rem", fontWeight: "bold", textAlign: "center", marginBottom: "30px" }}>
        Shop All Records
      </h2>

      {/* FILTER BAR */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", marginBottom: "30px", justifyContent: "center" }}>

        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", minWidth: "200px" }}
        />

        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", minWidth: "150px" }}
        >
          <option value="">All Genres</option>
          {GENRES.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        {/* ⭐ Decade Dropdown */}
        <select
          value={decade}
          onChange={(e) => setDecade(e.target.value)}
          style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", minWidth: "150px" }}
        >
          <option value="">All Decades</option>
          {DECADES.map((dec) => (
            <option key={dec.label} value={dec.label}>{dec.label}</option>
          ))}
        </select>

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
          <option value="yearNewest">Release Year: New → Old</option>
          <option value="yearOldest">Release Year: Old → New</option>
        </select>
      </div>

      {/* GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "25px" }}>
        {paginatedListings.length > 0 ? (
          paginatedListings.map(renderListingCard)
        ) : (
          <p style={{ textAlign: "center", width: "100%" }}>No records found.</p>
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div style={{ marginTop: "30px", display: "flex", justifyContent: "center", gap: "10px" }}>
          <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              style={{
                padding: "8px 12px",
                border: "1px solid #ccc",
                backgroundColor: currentPage === i + 1 ? "#000" : "#fff",
                color: currentPage === i + 1 ? "#fff" : "#000",
              }}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* MODAL */}
      {selectedListing && (
        <div
          onClick={() => setSelectedListing(null)}
          style={{
            position: "fixed",
            top: 0, left: 0,
            width: "100%", height: "100%",
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#fff",
              padding: "30px",
              borderRadius: "10px",
              maxWidth: "400px",
              width: "90%",
              textAlign: "center"
            }}
          >
            <ListingImage listing={selectedListing} />
            
            <h2>{selectedListing.title}</h2>
            <p>{selectedListing.artist}</p>
            {selectedListing.genre && <p><em>{selectedListing.genre}</em></p>}
            {selectedListing.releaseYear && <p>Released: {selectedListing.releaseYear}</p>}

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

            <button
              onClick={() => handleAddToCart(selectedListing.id)}
              style={{
                marginTop: "10px",
                width: "100%",
                padding: "10px",
                backgroundColor: "#000",
                color: "#fff",
                borderRadius: "5px"
              }}
            >
              Add to Cart
            </button>

            <button
              onClick={() => setSelectedListing(null)}
              style={{
                marginTop: "10px",
                width: "100%",
                padding: "10px",
                backgroundColor: "#ddd",
                borderRadius: "5px"
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Shop;
