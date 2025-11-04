// src/pages/Success.jsx
import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";

function Success() {
  const location = useLocation();
  const [message, setMessage] = useState("Processing your order...");
  const [order, setOrder] = useState(null);

  useEffect(() => {
    // Get session_id from query string
    const params = new URLSearchParams(location.search);
    const sessionId = params.get("session_id");

    if (!sessionId) {
      setMessage("❌ No session found.");
      return;
    }

    const token = localStorage.getItem("token");

    // Optionally fetch order details from backend using sessionId
    const fetchOrder = async () => {
      try {
        const res = await fetch(`http://localhost:5000/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          // Find the most recent order (or match by Stripe session metadata if stored)
          const recentOrder = data[data.length - 1];
          setOrder(recentOrder);
          setMessage("✅ Your order was successful!");
        } else {
          setMessage("✅ Payment successful! Your order will appear soon.");
        }
      } catch (err) {
        console.error(err);
        setMessage("✅ Payment successful! Unable to fetch order details.");
      }
    };

    fetchOrder();
  }, [location]);

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Order Confirmation</h1>
      <p>{message}</p>

      {order && (
        <div style={{ border: "1px solid #ddd", padding: "15px", borderRadius: "5px", maxWidth: "400px" }}>
          <h2>Order #{order.id}</h2>
          <p><strong>Total:</strong> ${order.totalPrice}</p>
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Shipping:</strong> {order.shippingAddress}</p>
          <h3>Items:</h3>
          <ul>
            {order.items.map((item) => (
              <li key={item.id}>
                {item.listing.title} - ${item.price}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link to="/" style={{ marginTop: "20px", display: "inline-block", color: "#007bff" }}>
        ← Back to Home
      </Link>
    </div>
  );
}

export default Success;
