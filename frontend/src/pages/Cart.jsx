// src/pages/Cart.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // Fetch cart items
  const fetchCart = async () => {
    if (!token) return;

    try {
      const res = await fetch("http://localhost:5000/carts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCartItems(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setMessage("❌ Could not fetch cart items.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Remove an item from cart
  const removeFromCart = async (cartItemId) => {
    try {
      const res = await fetch(`http://localhost:5000/carts/${cartItemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
      } else {
        setMessage("❌ Could not remove item.");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Something went wrong.");
    }
  };

  // Stripe checkout
  const handleProceedToCheckout = async () => {
    if (cartItems.length === 0) {
      setMessage("🛒 Your cart is empty.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          // You can collect shipping info here if desired
          fullName: "Customer Name",
          address: "123 Main St",
          city: "City",
          state: "State",
          zip: "12345",
        }),
      });

      const data = await res.json();

      if (data.url) {
        // Redirect to Stripe hosted checkout
        window.location.href = data.url;
      } else {
        setMessage("❌ Failed to create checkout session.");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Something went wrong with checkout.");
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.listing.price, 0);

  if (loading) return <p>Loading cart...</p>;

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>🛒 Your Cart</h1>
      {message && <p>{message}</p>}

      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div style={{ display: "grid", gap: "15px" }}>
            {cartItems.map((item) => (
              <div key={item.id} style={{ display: "flex", gap: "15px", border: "1px solid #ddd", padding: "10px", borderRadius: "5px" }}>
                <img src={item.listing.imageUrl} alt={item.listing.title} style={{ width: "100px", height: "100px", objectFit: "cover" }} />
                <div style={{ flex: 1 }}>
                  <h2 style={{ margin: 0 }}>{item.listing.title}</h2>
                  <p style={{ margin: 0 }}>{item.listing.artist}</p>
                  <p style={{ margin: "5px 0" }}>${item.listing.price}</p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={{ padding: "5px 10px", background: "red", color: "#fff", border: "none", borderRadius: "3px", cursor: "pointer" }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <h3>Total: ${totalPrice.toFixed(2)}</h3>
          <button
            onClick={handleProceedToCheckout}
            style={{ padding: "10px 20px", background: "#007bff", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}
          >
            Proceed to Checkout
          </button>
        </>
      )}
    </div>
  );
}

export default Cart;
