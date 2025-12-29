import { useState, useEffect, useRef } from "react";
import { bestFitGenre, mapDiscogsGenre } from "../helpers/discogsGenreMap";

function Admin() {
  const [upc, setUPC] = useState("");
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [genre, setGenre] = useState("");
  const [releaseYear, setReleaseYear] = useState("");  // NEW
  const [featured, setFeatured] = useState(false);
  const [onSale, setOnSale] = useState(false);
  const [salePrice, setSalePrice] = useState("");
  const [message, setMessage] = useState("");
  const [photo_front, setPhoto_front] = useState(null);
  const [photo_back, setPhoto_back] = useState(null);

  const GENRES = [
    "Rock",
    "Pop",
    "Hip-Hop",
    "Jazz",
    "Electronic",
    "Metal",
    "Country",
    "Classical",
    "R&B",
    "Folk",
    "Reggae",
    "Soundtrack",
  ];
  
  const upcRef = useRef(null);
  useEffect(()=> {
    if (upcRef.current) {
      upcRef.current.focus();
    }
  }, []);
  const handleUPCBlur = async () => {
    if (!upc) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/listings/discogs?upc=${upc}`);
      if (!res.ok) throw new Error("Discogs lookup failed");
      const data = await res.json();

      if (data.results && data.results.length > 0) {
        const release = data.results.find(r => r.country === "US") || data.results[0];
        if (release){
          //discogs has {artist} - {title} in the title attribute, so split them
          let artistName = "";
          let releaseTitle = "";
          if (release.title){
            const parts = release.title.split(" - ");
            if (parts.length >= 2){
              artistName = parts[0].trim();
              releaseTitle = parts.slice(1).join(" - ").trim();
            } else {
              releaseTitle = release.title;
            }
          }
          setTitle(releaseTitle);
          setArtist(artistName);
          setImageUrl(release.cover_image || "");
          setReleaseYear(release.year || "");

          const mapped = bestFitGenre(release.genre);
          if (mapped && GENRES.includes(mapped)) {
            setGenre(mapped);
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("❌ You must be logged in as admin.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("upc", upc);
      formData.append("title", title);
      formData.append("artist", artist);
      formData.append("genre", genre);
      formData.append("releaseYear", releaseYear ? parseInt(releaseYear) : "");
      formData.append("price", price);
      formData.append("condition", condition);
      formData.append("imageUrl", imageUrl);
      formData.append("featured", featured);
      formData.append("onSale", onSale);
      if (onSale) {
        formData.append("salePrice", salePrice);
      }
      if (photo_front) {
        formData.append("photo_front", photo_front);
      }
      if (photo_back) {
        formData.append("photo_back", photo_back);
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/listings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        setMessage("✅ Listing created successfully!");

        // reset form
        setUPC("");
        setTitle("");
        setArtist("");
        setPrice("");
        setCondition("");
        setImageUrl("");
        setGenre("");
        setReleaseYear(""); // NEW
        setFeatured(false);
        setOnSale(false);
        setSalePrice("");
        setPhoto_front(null);
        setPhoto_back(null);
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

        <input
          ref={upcRef}
          value={upc}
          onChange={(e) => setUPC(e.target.value)}
          onBlur={handleUPCBlur}
          placeholder="UPC"
          required
        />          
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
        />

        <input
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          placeholder="Artist"
          required
        />

        {/* GENRE DROPDOWN */}
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          required
        >
          <option value="">Select Genre</option>
          {GENRES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        {/* RELEASE YEAR */}
        <input
          type="number"
          value={releaseYear}
          onChange={(e) => setReleaseYear(e.target.value)}
          placeholder="Release Year (e.g. 1999)"
          min="1900"
          max={new Date().getFullYear()}
        />

        <input
          value={price}
          type="number"
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price (integer)"
          required
        />

        <input
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          placeholder="Condition"
          required
        />

        <input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Stock Image URL"
          required
        />

        <label>
          Album Front&nbsp;
          <input
            type = "file"
            accept = "image/*"
            capture = "environment"
            onChange = {(e) => setPhoto_front(e.target.files[0])}
          />
        </label>

        <label>
          Album Back&nbsp;
          <input
            type = "file"
            accept = "image/*"
            capture = "environment"
            onChange = {(e) => setPhoto_back(e.target.files[0])}
          />
        </label>

        <label>
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
          />
          Featured
        </label>

        <label>
          <input
            type="checkbox"
            checked={onSale}
            onChange={(e) => setOnSale(e.target.checked)}
          />
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
            background: "#000",
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
