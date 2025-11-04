import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Orders from "./pages/Orders";
import Cart from "./pages/Cart";
import Success from "./pages/Success";
// import Checkout from "./pages/Checkout"; // ❌ no longer needed
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

  return (
    <div>
      <nav style={{ padding: "1rem", background: "#222", display: "flex", gap: "1rem" }}>
        <Link to="/" style={{ color: "white" }}>Home</Link>

        {!isLoggedIn ? (
          <>
            <Link to="/login" style={{ color: "white" }}>Login</Link>
            <Link to="/signup" style={{ color: "white" }}>Signup</Link>
          </>
        ) : (
          <>
            <Link to="/orders" style={{ color: "white" }}>Orders</Link>
            <Link to="/cart" style={{ color: "white" }}>Cart</Link>
            {user?.isAdmin && <Link to="/admin" style={{ color: "white" }}>Admin</Link>}
            <button
              onClick={handleLogout}
              style={{ background: "transparent", border: "1px solid white", color: "white", padding: "5px 10px", cursor: "pointer" }}
            >
              Logout
            </button>
          </>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} setUser={setUser} />} />
        <Route path="/signup" element={<Signup setIsLoggedIn={setIsLoggedIn} setUser={setUser} />} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/success" element={<Success />} />
        {/* <Route path="/checkout" element={<Checkout />} /> ❌ removed */}
        <Route path="/admin" element={<ProtectedRoute adminOnly={true}><Admin /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

export default App;
