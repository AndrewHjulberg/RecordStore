// src/pages/Success.jsx
import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";

function Success() {
  const location = useLocation();
  const [message, setMessage] = useState("Processing your order...");
  const [order, setOrder] = useState(null);

  useEffect(() => {
  const params = new URLSearchParams(location.search);
  const sessionId = params.get("session_id");

  if (!sessionId) {
    setMessage("❌ No session found.");
    return;
  }

  const token = localStorage.getItem("token");

  const fetchOrder = async () => {
    try {
      // Retry a few times in case webhook hasn’t finished
      for (let attempt = 0; attempt < 5; attempt++) {
        const res = await fetch(`http://localhost:5000/orders/session/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setOrder(data);
          setMessage("✅ Your order was successful!");
          return;
        }

        // Wait 2 seconds and retry
        await new Promise((r) => setTimeout(r, 2000));
      }

      setMessage("✅ Payment successful! Your order will appear soon.");
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
