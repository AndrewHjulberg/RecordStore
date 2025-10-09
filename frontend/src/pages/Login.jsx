import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ setIsLoggedIn, setUser }) { // <-- add setUser prop
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

        setUser(decoded);           // <-- set user state
        setIsLoggedIn(true);        // <-- update navbar state
        navigate("/orders");        // redirect after login
      } else {
        alert(data.error || "Login failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h1>Login</h1>
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
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;
