import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import GoogleLinkPrompt from "../components/GoogleLinkPrompt"; //  reusable modal
import useGoogleAuth from "../hooks/useGoogleAuth"; //  shared hook
import "../assets/css/Login.css";

function Login({ setIsLoggedIn, setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const {
    showPrompt,
    handleGoogleSuccess,
    handleGoogleError,
    confirmGoogle,
    cancelGoogle,
  } = useGoogleAuth(setUser, setIsLoggedIn);

  // Username/password login
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
        const decoded = JSON.parse(atob(data.token.split(".")[1]));
        setUser(decoded);
        setIsLoggedIn(true);
        navigate("/orders");
      } else {
        alert(data.error || "Login failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "10px",
        textAlign: "center",
      }}
    >
      <form
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
        onSubmit={handleLogin}
      >
        <h1
          style={{
            fontFamily: "Impact, sans-serif",
            letterSpacing: "2px",
            marginBottom: "20px",
          }}
        >
          VINYLVERSE
        </h1>
        <p className="login-subtitle">Please sign in to continue</p>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          style={{
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          style={{
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />

        <button
          type="submit"
          style={{
            padding: "10px",
            backgroundColor: "#000",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Login
        </button>

        <p style={{ marginTop: "15px", fontSize: "0.9rem" }}>
          Don’t have an account?{" "}
          <Link
            to="/signup"
            style={{ color: "#007bff", textDecoration: "underline" }}
          >
            Create one
          </Link>
        </p>
      </form>

      <div className="divider">
        <span>Or continue with</span>
      </div>

      <div className="google-login">
        <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
      </div>

      {showPrompt && (
        <GoogleLinkPrompt onConfirm={confirmGoogle} onCancel={cancelGoogle} />
      )}
    </div>
  );
}

export default Login;