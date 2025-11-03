import { useEffect, useState } from "react";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");

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
          setOrders([]);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  const handleCancel = async (orderId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:5000/orders/${orderId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderId));
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
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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
              <h2>Order #{order.id}</h2>
              <p>Status: {order.status}</p>
              <p>
                <strong>Total:</strong> ${order.totalPrice?.toFixed(2) || "0.00"}
              </p>
              <p style={{ fontSize: "12px", color: "#888" }}>
                Ordered on: {new Date(order.createdAt).toLocaleString()}
              </p>

              <h3 style={{ marginTop: "15px" }}>Items:</h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: "10px",
                  marginTop: "10px",
                }}
              >
                {order.orderItems?.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      border: "1px solid #eee",
                      borderRadius: "6px",
                      padding: "10px",
                      textAlign: "center",
                    }}
                  >
                    <img
                      src={item.listing?.imageUrl}
                      alt={item.listing?.title || "Record"}
                      style={{
                        width: "100%",
                        height: "120px",
                        objectFit: "cover",
                        borderRadius: "4px",
                        marginBottom: "8px",
                      }}
                    />
                    <strong>{item.listing?.title}</strong>
                    <p style={{ margin: "5px 0", color: "#555" }}>
                      {item.listing?.artist}
                    </p>
                    <p style={{ color: "#333" }}>${item.listing?.price}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleCancel(order.id)}
                style={{
                  backgroundColor: "#dc3545",
                  color: "#fff",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  marginTop: "15px",
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
