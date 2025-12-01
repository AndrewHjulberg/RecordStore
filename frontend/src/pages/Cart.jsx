import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCart = async () => {
      if (!token) return setLoading(false);
      try {
        const res = await fetch("http://localhost:5000/carts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCartItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setMessage("❌ Could not fetch cart items.");
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const removeFromCart = async (cartItemId) => {
    try {
      const res = await fetch(`http://localhost:5000/carts/${cartItemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
      else setMessage("❌ Could not remove item.");
    } catch (err) {
      console.error(err);
      setMessage("❌ Something went wrong.");
    }
  };

  const handleProceedToCheckout = async () => {
    if (cartItems.length === 0) {
      setMessage("Your cart is empty.");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            listingId: item.listing.id,
            price: item.listing.salePrice ?? item.listing.price, // use salePrice if it exists
            quantity: 1
          })),
          fullName: "Customer Name",
          address: "123 Main St",
          city: "City",
          state: "State",
          zip: "12345",
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setMessage("❌ Failed to create checkout session.");
    } catch (err) {
      console.error(err);
      setMessage("❌ Something went wrong with checkout.");
    }
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + ((item.listing.salePrice ?? item.listing.price)),
    0
  );

  if (loading) return <p>Loading cart...</p>;

  return (
    <div style={{ maxWidth: "900px", margin: "50px auto", padding: "20px", fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>My Cart</h1>
      {message && <p style={{ color: "red", textAlign: "center" }}>{message}</p>}

      {cartItems.length === 0 ? (
        <p style={{ textAlign: "center" }}>Your cart is empty.</p>
      ) : (
        <>
          <div style={{ display: "grid", gap: "20px" }}>
            {cartItems.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  gap: "15px",
                  border: "1px solid #ddd",
                  padding: "15px",
                  borderRadius: "8px",
                  backgroundColor: "#fff",
                }}
              >
                <img
                  src={item.listing.imageUrl}
                  alt={item.listing.title}
                  style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "6px" }}
                />
                <div style={{ flex: 1 }}>
                  <h2 style={{ margin: "0 0 5px 0" }}>{item.listing.title}</h2>
                  <p style={{ margin: "0 0 5px 0", color: "#555" }}>{item.listing.artist}</p>
                  <p style={{ margin: "0 0 5px 0", fontStyle: "italic", color: "#777" }}>{item.listing.genre}</p>
                  <p style={{ margin: "5px 0", fontWeight: "bold" }}>
                    {item.listing.salePrice ? (
                      <>
                        <span
                          style={{
                            textDecoration: "line-through",
                            color: "#888",
                            marginRight: "8px",
                          }}
                        >
                          ${item.listing.price.toFixed(2)}
                        </span>
                        <span>${item.listing.salePrice.toFixed(2)}</span>
                      </>
                    ) : (
                      <>${item.listing.price.toFixed(2)}</>
                    )}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#dc3545",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <h3 style={{ marginTop: "20px", textAlign: "right" }}>Total: ${totalPrice.toFixed(2)}</h3>
          <div style={{ textAlign: "right" }}>
            <button
              onClick={handleProceedToCheckout}
              style={{
                padding: "10px 20px",
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
