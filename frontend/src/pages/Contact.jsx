import { useState } from "react";

export default function Contact({ user }) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setStatus("❌ You must be logged in to send a message.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      if (res.ok) setStatus("✅ Message sent!");
      else setStatus("❌ " + (data.error || "Failed to send message"));
      setMessage("");
    } catch (err) {
      console.error(err);
      setStatus("❌ Something went wrong");
    }
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "50px auto",
        fontFamily: "sans-serif",
        textAlign: "center",
        color: "#000",
        backgroundColor: "#fff",
        padding: "30px",
        borderRadius: "8px",
        border: "1px solid #000",
      }}
    >
      <h1 style={{ marginBottom: "20px" }}>Contact Us</h1>
      {status && (
        <p style={{ marginBottom: "20px", fontWeight: "bold" }}>{status}</p>
      )}
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Your message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "15px",
            border: "1px solid #000",
            borderRadius: "4px",
            fontFamily: "sans-serif",
            fontSize: "1rem",
          }}
          required
        />
        <br />
        <button
          type="submit"
          style={{
            padding: "10px 25px",
            border: "1px solid #000",
            borderRadius: "4px",
            backgroundColor: "#000",
            color: "#fff",
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          Send Message
        </button>
      </form>
    </div>
  );
}
