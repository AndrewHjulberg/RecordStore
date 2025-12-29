import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import GoogleLinkPrompt from "../components/GoogleLinkPrompt"; //  reusable modal
import useGoogleAuth from "../hooks/useGoogleAuth"; //  shared hook

function Signup({ setIsLoggedIn, setUser }) {
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

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/signup`, {
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
        alert(data.error || "Signup failed");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
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
      <h1 style={{ marginBottom: "20px" }}>Create Account</h1>
      <form
        onSubmit={handleSignup}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
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
          Sign Up
        </button>
      </form>

      <p style={{ marginTop: "15px", fontSize: "0.9rem" }}>
        Already have an account?{" "}
        <Link
          to="/login"
          style={{ color: "#007bff", textDecoration: "underline" }}
        >
          Login
        </Link>
      </p>

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

export default Signup;