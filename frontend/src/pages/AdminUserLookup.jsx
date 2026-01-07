import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";


function AdminUserLookup() {
  const [searchParams] = useSearchParams();  
  const initialId = searchParams.get("id") || "";
  const [query, setQuery] = useState(initialId);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialId) {
        lookupUser();
    }
    }, [initialId]);
  const lookupUser = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setUser(null);

    const token = localStorage.getItem("token");

    const isEmail = query.includes("@");
    const param = isEmail ? `email=${query}` : `id=${query}`;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/users/lookup?${param}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("User not found");

      const data = await res.json();
      setUser(data);
    } catch (err) {
      setError("User not found");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") lookupUser();
  };

  return (
    <div style={{ maxWidth: "900px", margin: "40px auto" }}>
      <h1>User Lookup</h1>

      <input
        type="text"
        placeholder="Enter email or user ID"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKey}
        style={{
          padding: "10px",
          width: "250px",
          marginRight: "10px",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
      />

      <button
        onClick={lookupUser}
        style={{
          padding: "10px 15px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Lookup
      </button>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {user && (
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            backgroundColor: "#fff",
          }}
        >
          <h2>User Details</h2>
          <p><strong>Id:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Admin:</strong> {user.isAdmin ? "Yes" : "No"}</p>
          <p><strong>Created:</strong> {new Date(user.createdAt).toLocaleString()}</p>

          <h3 style={{ marginTop: "20px" }}>Orders</h3>
          {user.orders.length === 0 && <p>No orders</p>}
          {user.orders.map((o) => (
            <div key={o.id} style={{ marginBottom: "10px" }}>
                <Link
                    to={`/admin/order-lookup?id=${o.id}`}
                    style={{ color: "#007bff", textDecoration: "underline", cursor: "pointer" }}
                    >
                    Order #{o.id}
                </Link>
                {" — "}
                ${o.totalPrice.toFixed(2)} — {o.status}
            </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default AdminUserLookup;