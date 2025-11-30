import { useState } from "react";

function Admin() {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [genre, setGenre] = useState("");
  const [featured, setFeatured] = useState(false);
  const [onSale, setOnSale] = useState(false);
  const [salePrice, setSalePrice] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("❌ You must be logged in as admin.");
      return;
    }

    try {
      // Convert to integers
      const body = {
        title,
        artist,
        genre,
        price: parseInt(price),        // INT
        condition,
        imageUrl,
        featured,
        onSale,
      };

      // Only include salePrice if onSale is true
      if (onSale) {
        body.salePrice = parseInt(salePrice);   // INT
      }

      const res = await fetch("http://localhost:5000/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setMessage("✅ Listing created successfully!");
        setTitle("");
        setArtist("");
        setPrice("");
        setCondition("");
        setImageUrl("");
        setGenre("");
        setFeatured(false);
        setOnSale(false);
        setSalePrice("");
      } else {
        const error = await res.json();
        setMessage("❌ Error: " + error.error);
      }
    } catch (err) {
      console.error("Error:", err);
      setMessage("❌ Something went wrong.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>🛠 Admin: Add New Listing</h1>
      {message && <p>{message}</p>}

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          maxWidth: "400px",
        }}
      >
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
        <input value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Artist" required />
        <input value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="Genre" required />
        <input value={price} type="number" onChange={(e) => setPrice(e.target.value)} placeholder="Price (integer)" required />
        <input value={condition} onChange={(e) => setCondition(e.target.value)} placeholder="Condition" required />
        <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Image URL" required />

        <label>
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
          Featured
        </label>

        <label>
          <input type="checkbox" checked={onSale} onChange={(e) => setOnSale(e.target.checked)} />
          On Sale
        </label>

        {onSale && (
          <input
            value={salePrice}
            type="number"
            onChange={(e) => setSalePrice(e.target.value)}
            placeholder="Sale Price (integer)"
            required
          />
        )}

        <button
          type="submit"
          style={{
            padding: "10px",
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Add Listing
        </button>
      </form>
    </div>
  );
}

export default Admin;
