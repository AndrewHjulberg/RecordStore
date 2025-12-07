import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function useGoogleAuth(setUser, setIsLoggedIn) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [lastCredential, setLastCredential] = useState(null);
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLastCredential(credentialResponse.credential);

      const res = await fetch("http://localhost:5000/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credential: credentialResponse.credential,
          useGoogle: false, // initial attempt
        }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        const decoded = JSON.parse(atob(data.token.split(".")[1]));
        setUser(decoded);
        setIsLoggedIn(true);
        navigate("/orders");
      } else if (data.errorCode === "ACCOUNT_EXISTS") {
        setShowPrompt(true); // show modal
      } else {
        alert(data.error || "Google login failed");
      }
    } catch (error) {
      console.error("Google login error:", error);
    }
  };

  const confirmGoogle = async () => {
    try {
      const res = await fetch("http://localhost:5000/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: lastCredential, useGoogle: true }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        const decoded = JSON.parse(atob(data.token.split(".")[1]));
        setUser(decoded);
        setIsLoggedIn(true);
        navigate("/orders");
      } else {
        alert(data.error || "Google login failed");
      }
    } catch (error) {
      console.error("Google login retry error:", error);
    }
    setShowPrompt(false);
  };

  const cancelGoogle = () => {
    setShowPrompt(false);
    alert("Please log in with your password instead.");
  };

  const handleGoogleError = () => {
    console.error("Google Login Failed");
    alert("Google login failed. Please try again.");
  };

  return {
    showPrompt,
    handleGoogleSuccess,
    handleGoogleError,
    confirmGoogle,
    cancelGoogle,
  };
}