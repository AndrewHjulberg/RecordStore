import { useEffect, useState } from "react";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Loading orders...</p>;
  if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;

  return (
    <div style={{ maxWidth: "900px", margin: "50px auto", padding: "20px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>My Orders</h1>

      {orders.length === 0 ? (
        <p style={{ textAlign: "center" }}>No orders yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const previewItems = order.items?.slice(0, 2);

            return (
              <div
                key={order.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "15px",
                  backgroundColor: "#fff",
                }}
              >
                {/* ORDER HEADER */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                  }}
                >
                  <div>
                    <strong>Order #{order.id}</strong>
                    <div style={{ fontSize: "14px", color: "#666" }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontWeight: "bold",
                        textTransform: "capitalize",
                        color:
                          order.status === "paid"
                            ? "green"
                            : order.status === "pending"
                            ? "#cc8400"
                            : "#555",
                      }}
                    >
                      {order.status}
                    </div>
                    <div style={{ fontWeight: "bold" }}>
                      ${order.totalPrice?.toFixed(2) || "0.00"}
                    </div>
                  </div>
                </div>

                {/* ITEM PREVIEW (first 2 only) */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {previewItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        gap: "15px",
                        borderTop: "1px solid #eee",
                        paddingTop: "10px",
                      }}
                    >
                      {item.listing?.imageUrl && (
                        <img
                          src={item.listing.imageUrl}
                          alt={item.listing.title}
                          style={{
                            width: "70px",
                            height: "70px",
                            objectFit: "cover",
                            borderRadius: "6px",
                          }}
                        />
                      )}

                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: "bold" }}>
                          {item.listing?.title}
                        </div>
                        <div style={{ color: "#555" }}>
                          {item.listing?.artist}
                        </div>
                      </div>

                      <div style={{ fontWeight: "bold" }}>
                        ${item.price?.toFixed(2)}
                      </div>
                    </div>
                  ))}

                  {order.items.length > 2 && !isExpanded && (
                    <div style={{ color: "#666", fontSize: "14px" }}>
                      + {order.items.length - 2} more item(s)
                    </div>
                  )}
                </div>

                {/* VIEW ORDER BUTTON */}
                <div style={{ marginTop: "15px", textAlign: "right" }}>
                  <button
                    onClick={() =>
                      setExpandedOrderId(isExpanded ? null : order.id)
                    }
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "#007bff",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    {isExpanded ? "Hide Order Details" : "View Order"}
                  </button>
                </div>

                {/* EXPANDED DETAILS */}
                {isExpanded && (
                  <div
                    style={{
                      marginTop: "20px",
                      paddingTop: "15px",
                      borderTop: "1px solid #ddd",
                    }}
                  >
                    <h4>Order Items</h4>

                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          display: "flex",
                          gap: "15px",
                          marginBottom: "10px",
                        }}
                      >
                        {item.listing?.imageUrl && (
                          <img
                            src={item.listing.imageUrl}
                            alt={item.listing.title}
                            style={{
                              width: "60px",
                              height: "60px",
                              objectFit: "cover",
                              borderRadius: "6px",
                            }}
                          />
                        )}

                        <div style={{ flex: 1 }}>
                          <strong>{item.listing?.title}</strong>
                          <div style={{ color: "#555" }}>
                            {item.listing?.artist}
                          </div>
                        </div>

                        <div>${item.price?.toFixed(2)}</div>
                      </div>
                    ))}

                    {/* SHIPPING INFO */}
                    {order.shippingAddress && (
                      <>
                        <h4 style={{ marginTop: "15px" }}>Shipping Address</h4>
                        <p style={{ color: "#555", lineHeight: "1.5" }}>
                          {order.shippingAddress}
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Orders;
