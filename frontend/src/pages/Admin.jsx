import { useState } from "react";

function Admin() {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("❌ You must be logged in as admin.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, artist, price, condition, imageUrl }),
      });

      if (res.ok) {
        setMessage("✅ Listing created successfully!");
        setTitle(""); setArtist(""); setPrice(""); setCondition(""); setImageUrl("");
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

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "400px" }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
        <input value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Artist" required />
        <input value={price} type="number" onChange={(e) => setPrice(e.target.value)} placeholder="Price" required />
        <input value={condition} onChange={(e) => setCondition(e.target.value)} placeholder="Condition" required />
        <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Image URL" required />
        <button type="submit" style={{ padding: "10px", background: "#007bff", color: "#fff", border: "none", borderRadius: "5px" }}>
          Add Listing
        </button>
      </form>
    </div>
  );
}

export default Admin;
