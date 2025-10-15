import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Checkout() {
  const [form, setForm] = useState({
    fullName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in first");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        alert("Order placed successfully!");
        navigate("/orders");
      } else {
        const err = await res.json();
        alert("Checkout failed: " + err.error);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("An error occurred during checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h1>Checkout</h1>
      <form onSubmit={handleSubmit}>
        <h3>Shipping Information</h3>
        <input
          name="fullName"
          placeholder="Full Name"
          value={form.fullName}
          onChange={handleChange}
          required
        />
        <input
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
          required
        />
        <input
          name="city"
          placeholder="City"
          value={form.city}
          onChange={handleChange}
          required
        />
        <input
          name="state"
          placeholder="State"
          value={form.state}
          onChange={handleChange}
          required
        />
        <input
          name="zip"
          placeholder="ZIP Code"
          value={form.zip}
          onChange={handleChange}
          required
        />

        <h3>Payment Details</h3>
        <input
          name="cardNumber"
          placeholder="Card Number"
          value={form.cardNumber}
          onChange={handleChange}
          required
        />
        <input
          name="expiry"
          placeholder="MM/YY"
          value={form.expiry}
          onChange={handleChange}
          required
        />
        <input
          name="cvv"
          placeholder="CVV"
          value={form.cvv}
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: "15px",
            padding: "10px 20px",
            background: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {loading ? "Processing..." : "Place Order"}
        </button>
      </form>
    </div>
  );
}

export default Checkout;
