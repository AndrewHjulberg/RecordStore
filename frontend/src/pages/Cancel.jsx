// src/pages/Cancel.jsx
import { Link } from "react-router-dom";

function Cancel() {
  return (
    <div style={{
      fontFamily: "Arial, sans-serif",
      minHeight: "100vh",
      backgroundColor: "#fff",
      color: "#000",
      padding: "80px 20px 20px 20px", // shift content higher
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
    }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "10px" }}>
        Order Cancelled
      </h1>
      <p style={{ fontSize: "1.2rem", marginBottom: "30px" }}>
        ❌ Your order was not completed. You can continue browsing our store or return to your cart.
      </p>

      <div style={{ display: "flex", gap: "15px" }}>
        <Link to="/shop" style={{
          padding: "12px 25px",
          backgroundColor: "#000",
          color: "#fff",
          textDecoration: "none",
          borderRadius: "6px",
          fontSize: "1rem",
          cursor: "pointer"
        }}>
          Browse Shop
        </Link>
        <Link to="/cart" style={{
          padding: "12px 25px",
          backgroundColor: "#000",
          color: "#fff",
          textDecoration: "none",
          borderRadius: "6px",
          fontSize: "1rem",
          cursor: "pointer"
        }}>
          Return to Cart
        </Link>
      </div>
    </div>
  );
}

export default Cancel;
