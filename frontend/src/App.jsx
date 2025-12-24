import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Orders from "./pages/Orders";
import Cart from "./pages/Cart";
import Contact from "./pages/Contact";
import Success from "./pages/Success";
import Cancel from "./pages/Cancel";
import Admin from "./pages/Admin";
import ProtectedRoute from "./ProtectedRoute";
import React from "react";

import Shop from "./pages/Shop";
import Settings from "./pages/Settings";

function App() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ⭐ Initialize login state synchronously
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (!token) return false;
    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      return !!decoded;
    } catch {
      return false;
    }
  });

  const [user, setUser] = useState(() => {
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return null;
    }
  });

  const [showDropdown, setShowDropdown] = useState(false);

  // ⭐ Shared cart state across the app
  const [cartItems, setCartItems] = useState([]);

  // Optional: keep login state in sync across tabs
  useEffect(() => {
    const handleStorageChange = () => {
      const t = localStorage.getItem("token");
      if (t) {
        try {
          const decoded = JSON.parse(atob(t.split(".")[1]));
          setUser(decoded);
          setIsLoggedIn(true);
        } catch {
          setUser(null);
          setIsLoggedIn(false);
        }
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setCartItems([]);
    setIsLoggedIn(false);
    setUser(null);
    setShowDropdown(false);
    navigate("/login");
  };

  const linkStyle = {
    textDecoration: "none",
    color: "#000",
    cursor: "pointer",
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>
      {/* Nav Bar */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 50px",
          borderBottom: "1px solid #ddd",
          position: "relative",
        }}
      >
        <h1
          style={{
            fontFamily: "Impact, sans-serif",
            fontSize: "2.5rem",
            letterSpacing: "2px",
          }}
        >
          VINYLVERSE
        </h1>

        <nav
          style={{
            display: "flex",
            gap: "25px",
            textTransform: "uppercase",
            fontSize: "0.9rem",
            alignItems: "center",
          }}
        >
          <Link to="/" style={linkStyle}>
            Home
          </Link>
          <Link to="/shop" style={linkStyle}>
            Shop
          </Link>

          {/* Cart always visible */}
          <Link to="/cart" style={linkStyle}>
            Cart
          </Link>

          <Link to="/about" style={linkStyle}>
            About
          </Link>
          <Link to="/contact" style={linkStyle}>
            Contact
          </Link>

          {user?.isAdmin && <Link to="/admin" style={linkStyle}>Admin</Link>}

          {!isLoggedIn && (
            <>
              <Link to="/login" style={linkStyle}>
                Login
              </Link>
              <Link to="/signup" style={linkStyle}>
                Create Account
              </Link>
            </>
          )}

          {isLoggedIn && (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowDropdown((prev) => !prev)}
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  backgroundColor: "#000",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>

              {showDropdown && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "48px",
                    background: "#fff",
                    border: "1px solid #ddd",
                    padding: "10px 0",
                    borderRadius: "6px",
                    width: "150px",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                    zIndex: 100,
                  }}
                >
                  <Link
                    to="/orders"
                    onClick={() => setShowDropdown(false)}
                    style={{
                      display: "block",
                      padding: "8px 15px",
                      color: "#000",
                      textDecoration: "none",
                    }}
                  >
                    Order History
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setShowDropdown(false)}
                    style={{
                      display: "block",
                      padding: "8px 15px",
                      color: "#000",
                      textDecoration: "none",
                    }}
                  >
                    Settings
                  </Link>

                  <span
                    onClick={handleLogout}
                    style={{
                      display: "block",
                      padding: "8px 15px",
                      color: "#000",
                      cursor: "pointer",
                    }}
                  >
                    Logout
                  </span>
                </div>
              )}
            </div>
          )}
        </nav>
      </header>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Home cartItems={cartItems} setCartItems={setCartItems} />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/contact" element={<Contact user={user} />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} setUser={setUser} />} />
        <Route path="/signup" element={<Signup setIsLoggedIn={setIsLoggedIn} setUser={setUser} />} />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />

        {/* Cart page now uses shared cart state */}
        <Route
          path="/cart"
          element={<Cart cartItems={cartItems} setCartItems={setCartItems} user={user} isLoggedIn={isLoggedIn} />}
        />

        <Route path="/success" element={<Success />} />
        <Route path="/cancel" element={<Cancel />} />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings user={user} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
