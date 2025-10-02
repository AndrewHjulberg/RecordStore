import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Signup({ setIsLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        setIsLoggedIn(true); // ✅ update navbar state
        navigate("/orders");
      } else {
        alert(data.error || "Signup failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSignup}>
      <h1>Signup</h1>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Signup</button>
    </form>
  );
}

export default Signup;
