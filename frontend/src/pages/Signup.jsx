import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Signup({ setIsLoggedIn, setUser }) { // <-- add setUser prop
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

        // Decode JWT to get user info
        const decoded = JSON.parse(atob(data.token.split(".")[1]));

        setUser(decoded);           // <-- set user state
        setIsLoggedIn(true);        // <-- update navbar state
        navigate("/orders");        // redirect
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
