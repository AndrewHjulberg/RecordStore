import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Orders from "./pages/Orders";
import Cart from "./pages/Cart";
import Success from "./pages/Success";
import Cancel from "./pages/Cancel";
import Admin from "./pages/Admin";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        setUser(decoded);
        setIsLoggedIn(true);
      } catch (err) {
        console.error("Invalid token:", err);
        setUser(null);
        setIsLoggedIn(false);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUser(null);
    navigate("/login");
  };

  const linkStyle = {
    textDecoration: "none",
    color: "#000",
    cursor: "pointer"
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>
      {/* Nav Bar */}
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 50px",
        borderBottom: "1px solid #ddd"
      }}>
        <h1 style={{ fontFamily: "Impact, sans-serif", fontSize: "2.5rem", letterSpacing: "2px" }}>
          VINYLVERSE
        </h1>
        <nav style={{ display: "flex", gap: "25px", textTransform: "uppercase", fontSize: "0.9rem" }}>
          <Link to="/" style={linkStyle}>Shop</Link>
          {isLoggedIn && <Link to="/cart" style={linkStyle}>Cart</Link>}
          {isLoggedIn && <Link to="/orders" style={linkStyle}>Orders</Link>}
          <Link to="/about" style={linkStyle}>About</Link>
          <Link to="/contact" style={linkStyle}>Contact</Link>
          {user?.isAdmin && <Link to="/admin" style={linkStyle}>Admin</Link>}

          {!isLoggedIn ? (
            <>
              <Link to="/login" style={linkStyle}>Login</Link>
              <Link to="/signup" style={linkStyle}>Create Account</Link>
            </>
          ) : (
            <span onClick={handleLogout} style={linkStyle}>Logout</span>
          )}
        </nav>
      </header>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} setUser={setUser} />} />
        <Route path="/signup" element={<Signup setIsLoggedIn={setIsLoggedIn} setUser={setUser} />} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/success" element={<Success />} />
        <Route path="/cancel" element={<Cancel />} />
        <Route path="/admin" element={<ProtectedRoute adminOnly={true}><Admin /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

export default App;
