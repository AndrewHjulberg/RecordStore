import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login({ setIsLoggedIn, setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);

        // Decode JWT to get user info
        const decoded = JSON.parse(atob(data.token.split(".")[1]));

        setUser(decoded);       // set user state
        setIsLoggedIn(true);    // update navbar state
        navigate("/orders");    // redirect after login
      } else {
        alert(data.error || "Login failed");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ddd", borderRadius: "10px", textAlign: "center" }}>
      <h1 style={{ marginBottom: "20px" }}>Login</h1>
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <button type="submit" style={{ padding: "10px", backgroundColor: "#000", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>
          Login
        </button>
      </form>
      <p style={{ marginTop: "15px", fontSize: "0.9rem" }}>
        Don't have an account?{" "}
        <Link to="/signup" style={{ color: "#007bff", textDecoration: "underline" }}>
          Create Account
        </Link>
      </p>
    </div>
  );
}

export default Login;
