import { useEffect, useState } from "react";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {

      const token = localStorage.getItem("token"); // token saved at login

      if (!token) {
      console.log("No token yet, skipping fetch");
      setLoading(false);
      return;
    }

      try {
        const res = await fetch("http://localhost:5000/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          console.warn("Unexpected response from /orders:", data);
          setOrders([]); // fallback to empty list
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <p>Loading orders...</p>;

  const handleCancel = async (orderId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:5000/orders/${orderId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        // Use functional update to avoid stale state
        setOrders((prevOrders) =>
          prevOrders.filter((order) => order.id !== orderId)
        );
      } else {
        const error = await res.json();
        alert("Error cancelling order: " + error.error);
      }
    } catch (err) {
      console.error("Error cancelling order:", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>📦 My Orders</h1>

      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "20px",
          }}
        >
          {orders.map((order) => (
            <div
              key={order.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "15px",
                backgroundColor: "#fff",
              }}
            >
              <img
                src={order.listing?.imageUrl}
                alt={order.listing?.title || "Record"}
                style={{ width: "100%", height: "150px", objectFit: "cover" }}
              />
              <h3>{order.listing?.title}</h3>
              <p>{order.listing?.artist}</p>
              <p>
                <strong>${order.listing?.price}</strong>
              </p>
              <p style={{ fontSize: "12px", color: "#888" }}>
                Ordered on: {new Date(order.createdAt).toLocaleString()}
              </p>

              {/* Cancel button */}
              <button
                onClick={() => handleCancel(order.id)}
                style={{
                  backgroundColor: "#dc3545",
                  color: "#fff",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  marginTop: "10px",
                }}
              >
                Cancel Order
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;
