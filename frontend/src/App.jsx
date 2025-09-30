// src/App.jsx
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Orders from "./pages/Orders";

function App() {
  return (
    <div>
      {/* ✅ Navbar */}
      <nav style={{ padding: "1rem", background: "#222", display: "flex", gap: "1rem" }}>
        <Link to="/" style={{ color: "white" }}>Home</Link>
        <Link to="/login" style={{ color: "white" }}>Login</Link>
        <Link to="/signup" style={{ color: "white" }}>Signup</Link>
        <Link to="/orders" style={{ color: "white" }}>Orders</Link>
      </nav>

      {/* ✅ Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/orders" element={<Orders />} />
      </Routes>
    </div>
  );
}

export default App;

