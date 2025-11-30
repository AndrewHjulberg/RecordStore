// src/pages/Cancel.jsx
import { Link } from "react-router-dom";

function Cancel() {
  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", textAlign: "center" }}>
      <h1>🛑 Payment Canceled</h1>
      <p>Your payment was canceled before completion.</p>
      <p>
        Don’t worry — your cart is still saved. You can return to checkout anytime to
        complete your order.
      </p>

      <div style={{ marginTop: "30px" }}>
        <Link
          to="/cart"
          style={{
            display: "inline-block",
            backgroundColor: "#007bff",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "6px",
            textDecoration: "none",
            marginRight: "10px",
          }}
        >
          🛒 Return to Cart
        </Link>

        <Link
          to="/"
          style={{
            display: "inline-block",
            color: "#007bff",
            textDecoration: "none",
          }}
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

export default Cancel;
