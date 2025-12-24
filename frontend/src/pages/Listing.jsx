import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

export default function Listing({ user }) {
    const { id } = useParams();
    const isEditing = Boolean(id);
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [artist, setArtist] = useState("");
    const [price, setPrice] = useState("");
    const [condition, setCondition] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [genre, setGenre] = useState("");
    const [releaseYear, setReleaseYear] = useState("");
    const [featured, setFeatured] = useState(false);
    const [onSale, setOnSale] = useState(false);
    const [salePrice, setSalePrice] = useState("");

    const [photo_front, setPhoto_front] = useState(null);
    const [photo_back, setPhoto_back] = useState(null);
    const [message, setMessage] = useState("");
    const [upc, setUpc] = useState("");
    const [authChecked, setAuthChecked] = useState(false);
    const token = localStorage.getItem("token");

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

    const [formData, setFormData] = useState({
        upc: "",
        title: "",
        artist: "",
        genre: "",
        price: "",
        condition: "",
        imageUrl: "",
        featured: false,
        onSale: false,
        salePrice: "",
        releaseYear: "",
    });
    useEffect(() => {
        if (!token) {
            navigate("/forbidden"); // or "/"
            return;
        }
        setAuthChecked(true);
    }, [token]);
    // Load listing when editing
    useEffect(() => {
        if (!isEditing) return;

        const token = localStorage.getItem("token");
        if (!token) {
            setMessage("❌ You are not authorized to view this page.");
            navigate("/"); // or /shop
            return;
        }

        fetch(`http://localhost:5000/listings/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => {
                if (res.status === 403) {
                    setMessage("❌ Access denied.");
                    navigate("/"); // redirect non-admins
                    return null;
                }
                if (!res.ok) {
                    throw new Error(`Failed to load listing: ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                if (!data) return; // already handled 403

                setTitle(data.title || "");
                setArtist(data.artist || "");
                setGenre(data.genre || "");
                setReleaseYear(data.releaseYear || "");
                setPrice(data.price || "");
                setCondition(data.condition || "");
                setImageUrl(data.imageUrl || "");
                setFeatured(data.featured || false);
                setOnSale(data.onSale || false);
                setSalePrice(data.salePrice || "");
                setUpc(data.upc || "");
            })
            .catch((err) => console.error("Error loading listing:", err));
    }, [id, isEditing]);
    const upcRef = useRef(null);
    useEffect(() => {
        if (upcRef.current) {
            upcRef.current.focus();
        }
    }, []);
    const handleUPCBlur = async () => {
        if (!upc) return;

        try {
            const res = await fetch(`http://localhost:5000/listings/discogs?upc=${upc}`);
            if (!res.ok) throw new Error("Discogs lookup failed");
            const data = await res.json();

            if (data.results && data.results.length > 0) {
                const release = data.results.find(r => r.country === "US") || data.results[0];
                if (release) {
                    //discogs has {artist} - {title} in the title attribute, so split them
                    let artistName = "";
                    let releaseTitle = "";
                    if (release.title) {
                        const parts = release.title.split(" - ");
                        if (parts.length >= 2) {
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

            // TEXT FIELDS
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

            // OPTIONAL IMAGES
            if (photo_front) {
                formData.append("photo_front", photo_front);
            }

            if (photo_back) {
                formData.append("photo_back", photo_back);
            }

            const res = await fetch(`http://localhost:5000/listings/${id}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!res.ok) {
                const error = await res.json();
                setMessage("❌ Error: " + error.error);
                return;
            }

            setMessage("✅ Listing updated successfully!");

            // OPTIONAL: redirect after save
            setTimeout(() => navigate("/shop"), 800);

        } catch (err) {
            console.error("Error:", err);
            setMessage("❌ Something went wrong.");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this listing? This cannot be undone.")) {
            return;
        }

        const token = localStorage.getItem("token");
        console.log("Token:", token);
        if (!token) {
            setMessage("❌ You must be logged in as admin.");
            return;
        }

        try {
            const res = await fetch(`http://localhost:5000/listings/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                const error = await res.json();
                setMessage("❌ Error: " + error.error);
                return;
            }

            setMessage("🗑️ Listing deleted successfully!");

            // Redirect after a short delay
            setTimeout(() => navigate("/shop"), 800);

        } catch (err) {
            console.error("Delete error:", err);
            setMessage("❌ Something went wrong while deleting.");
        }
    };
    if (!authChecked){
        return null;
    }
    return (
        <div style={{ padding: "20px" }}>
            <h1>{isEditing ? "✏️ Edit Listing" : "🛠 Add New Listing"}</h1>
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
                    value={upc}
                    onChange={(e) => setUpc(e.target.value)}
                    onBlur={handleUPCBlur}
                    placeholder="UPC"
                />
                {/* TITLE */}
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Title"
                    required
                />

                {/* ARTIST */}
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

                {/* PRICE */}
                <input
                    value={price}
                    type="number"
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Price (integer)"
                    required
                />

                {/* CONDITION */}
                <input
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    placeholder="Condition"
                    required
                />

                {/* STOCK IMAGE URL */}
                <input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Stock Image URL"
                    required
                />

                {/* FRONT IMAGE UPLOAD */}
                <label>
                    Album Front&nbsp;
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => setPhoto_front(e.target.files[0])}
                    />
                </label>

                {/* BACK IMAGE UPLOAD */}
                <label>
                    Album Back&nbsp;
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => setPhoto_back(e.target.files[0])}
                    />
                </label>

                {/* FEATURED */}
                <label>
                    <input
                        type="checkbox"
                        checked={featured}
                        onChange={(e) => setFeatured(e.target.checked)}
                    />
                    Featured
                </label>

                {/* ON SALE */}
                <label>
                    <input
                        type="checkbox"
                        checked={onSale}
                        onChange={(e) => setOnSale(e.target.checked)}
                    />
                    On Sale
                </label>

                {/* SALE PRICE */}
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
                    {isEditing ? "Save Changes" : "Add Listing"}
                </button>
                <button
                    type="button"
                    onClick={handleDelete}
                    style={{
                        padding: "10px",
                        background: "#b00000",
                        color: "#fff",
                        border: "none",
                        borderRadius: "5px",
                        marginTop: "10px",
                    }}
                >
                    Delete Listing
                </button>
            </form>
        </div>
    );
}