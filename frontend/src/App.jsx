// src/App.jsx
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Orders from "./pages/Orders";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <div>
      {/* ✅ Navbar */}
      <nav
        style={{
          padding: "1rem",
          background: "#222",
          display: "flex",
          gap: "1rem",
        }}
      >
        <Link to="/" style={{ color: "white" }}>
          Home
        </Link>

        {!isLoggedIn ? (
          <>
            <Link to="/login" style={{ color: "white" }}>
              Login
            </Link>
            <Link to="/signup" style={{ color: "white" }}>
              Signup
            </Link>
          </>
        ) : (
          <>
            <Link to="/orders" style={{ color: "white" }}>
              Orders
            </Link>
            <button
              onClick={handleLogout}
              style={{
                background: "transparent",
                border: "1px solid white",
                color: "white",
                padding: "5px 10px",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </>
        )}
      </nav>

      {/* ✅ Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/signup" element={<Signup setIsLoggedIn={setIsLoggedIn} />} />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
