import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getGuestCart, clearGuestCart, removeFromGuestCart } from "../helpers/guestCart";

function Cart({ cartItems, setCartItems, user, isLoggedIn }) {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const hasMigratedRef = useRef(false);

  // Load cart items when component mounts or token changes
  useEffect(() => {
    const fetchCart = async () => {
      // ✅ Only skip fetch if cart items are already hydrated
      if (cartItems.length > 0 && cartItems.every(item => item.listing)) {
        setLoading(false);
        return;
      }

      // Guest cart
      if (!token) {
        const guestItems = getGuestCart();
        if (guestItems.length === 0) {
          setCartItems([]);
          setLoading(false);
          return;
        }

        try {
          const listings = await Promise.all(
            guestItems.map(async (item) => {
              try {
                const res = await fetch(`http://localhost:5000/listings/${item.listingId}`);
                const data = await res.json();
                return {
                  id: `guest-${item.listingId}`,
                  listing: data,
                };
              } catch (err) {
                console.error(`Failed to fetch listing ${item.listingId}:`, err);
                return null;
              }
            })
          );
          setCartItems(listings.filter(Boolean));
        } catch (err) {
          console.error(err);
          setMessage("❌ Could not load guest cart items.");
        } finally {
          setLoading(false);
        }

        return;
      }

      // Logged-in user cart
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
  }, [token]);

  // Migrate guest cart to logged-in user after login
  useEffect(() => {
    const migrateGuestCart = async () => {
      if (!token) return;
      if (hasMigratedRef.current) return; // 🔒 hard stop

      const guestItems = cartItems.filter(
        item => typeof item.id === "string" && item.id.startsWith("guest-")
      );

      if (guestItems.length === 0) return;

      hasMigratedRef.current = true; // 🔒 lock migration

      try {
        const res = await fetch("http://localhost:5000/carts/migrate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            items: guestItems.map(item => ({
              listingId: item.listing.id,
            })),
          }),
        });

        const data = await res.json();

        // ✅ Backend is source of truth
        clearGuestCart();
        setCartItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to migrate guest cart:", err);
        hasMigratedRef.current = false; // allow retry if it fails
      }
    };

    migrateGuestCart();
  }, [token]); // ❗ DO NOT add cartItems


  // Remove item from cart
  const removeFromCart = async (cartItemId) => {
    // ✅ Per-item removal for guest cart
    if (!token && cartItemId.startsWith("guest-")) {
      const listingId = cartItemId.replace("guest-", "");
      removeFromGuestCart(listingId); // <- NEW
      setCartItems(prev => prev.filter(item => item.id !== cartItemId));
      return;
    }

    // Logged-in user removal
    try {
      const res = await fetch(`http://localhost:5000/carts/${cartItemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setCartItems(prev => prev.filter(item => item.id !== cartItemId));
      else setMessage("❌ Could not remove item.");
    } catch (err) {
      console.error(err);
      setMessage("❌ Something went wrong.");
    }
  };

  const handleProceedToCheckout = async () => {
    if (!token) {
      navigate("/login?redirect=/cart");
      return;
    }

    if (cartItems.length === 0) {
      setMessage("Your cart is empty.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          items: cartItems.map(item => ({ listingId: item.listing.id, price: item.listing.salePrice ?? item.listing.price })),
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

  if (loading) return <p>Loading cart...</p>;

  const totalPrice = cartItems.reduce((sum, item) => item.listing ? sum + (item.listing.salePrice ?? item.listing.price) : sum, 0);

  return (
    <div style={{ maxWidth: "900px", margin: "50px auto", padding: "20px", fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>My Cart</h1>
      {message && <p style={{ color: "red", textAlign: "center" }}>{message}</p>}

      {cartItems.length === 0 ? (
        <p style={{ textAlign: "center" }}>Your cart is empty.</p>
      ) : (
        <>
          <div style={{ display: "grid", gap: "20px" }}>
            {cartItems.map(item => (
              <div key={item.id} style={{ display: "flex", gap: "15px", border: "1px solid #ddd", padding: "15px", borderRadius: "8px", backgroundColor: "#fff" }}>
                {item.listing.imageUrl && <img src={item.listing.imageUrl} alt={item.listing.title} style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "6px" }} />}
                <div style={{ flex: 1 }}>
                  <h2 style={{ margin: "0 0 5px 0" }}>{item.listing.title || "Unknown Title"}</h2>
                  <p style={{ margin: "0 0 5px 0", color: "#555" }}>{item.listing.artist || "Unknown Artist"}</p>
                  <p style={{ margin: "0 0 5px 0", fontStyle: "italic", color: "#777" }}>{item.listing.genre || ""}</p>
                  <p style={{ margin: "5px 0", fontWeight: "bold" }}>
                    {item.listing.salePrice ? (
                      <>
                        <span style={{ textDecoration: "line-through", color: "#888", marginRight: "8px" }}>${item.listing.price?.toFixed(2) ?? "0.00"}</span>
                        <span>${item.listing.salePrice?.toFixed(2) ?? "0.00"}</span>
                      </>
                    ) : (
                      <>${item.listing.price?.toFixed(2) ?? "0.00"}</>
                    )}
                  </p>
                  <button onClick={() => removeFromCart(item.id)} style={{ padding: "5px 10px", backgroundColor: "#dc3545", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <h3 style={{ marginTop: "20px", textAlign: "right" }}>Total: ${totalPrice.toFixed(2)}</h3>
          <div style={{ textAlign: "right" }}>
            <button onClick={handleProceedToCheckout} style={{ padding: "10px 20px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
