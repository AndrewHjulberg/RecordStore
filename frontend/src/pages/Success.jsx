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
    <div style={{
      fontFamily: "Arial, sans-serif",
      minHeight: "100vh",
      backgroundColor: "#fff",
      color: "#000",
      padding: "40px 20px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "20px", textAlign: "center" }}>
        Order Confirmation
      </h1>
      <p style={{ fontSize: "1.2rem", marginBottom: "30px", textAlign: "center" }}>
        {message}
      </p>

      {order && (
        <div style={{
          border: "1px solid #eee",
          borderRadius: "10px",
          padding: "30px",
          maxWidth: "700px",
          width: "100%",
          backgroundColor: "#f9f9f9",
        }}>
          <h2 style={{ marginBottom: "15px" }}>Order #{order.id}</h2>
          <p style={{ fontSize: "1.1rem", margin: "5px 0" }}><strong>Total:</strong> ${order.totalPrice}</p>
          <p style={{ fontSize: "1.1rem", margin: "5px 0" }}><strong>Status:</strong> {order.status}</p>
          <p style={{ fontSize: "1.1rem", margin: "5px 0" }}><strong>Shipping:</strong> {order.shippingAddress}</p>

          <h3 style={{ marginTop: "20px", marginBottom: "10px" }}>Items:</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {order.items.map((item) => (
              <li key={item.id} style={{
                borderBottom: "1px solid #ddd",
                padding: "10px 0",
                display: "flex",
                justifyContent: "space-between"
              }}>
                <span>{item.listing.title}</span>
                <span>${item.price}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link to="/" style={{
        marginTop: "30px",
        padding: "12px 25px",
        backgroundColor: "#000",
        color: "#fff",
        textDecoration: "none",
        borderRadius: "6px",
        fontSize: "1rem",
        cursor: "pointer"
      }}>
        ← Back to Home
      </Link>
    </div>
  );
}

export default Success;
