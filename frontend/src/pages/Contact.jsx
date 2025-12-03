import { useState } from "react";

function Contact() {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Sending...");

    const token = localStorage.getItem("token");

    if (!token) {
      setStatus("You must be logged in to send a message.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("Message sent! We'll get back to you soon.");
        setMessage("");
      } else {
        setStatus(data.error || "Failed to send message.");
      }
    } catch (err) {
      console.error(err);
      setStatus("Something went wrong.");
    }
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      padding: "40px",
    }}>
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Contact Us
        </h2>

        <form onSubmit={handleSubmit}>
          <label style={{ display: "block", marginBottom: "10px" }}>
            Message:
          </label>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="6"
            placeholder="Write your message..."
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              resize: "vertical",
              fontSize: "15px",
            }}
          />

          <button
            type="submit"
            style={{
              marginTop: "20px",
              width: "100%",
              padding: "12px",
              background: "#000",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Send Message
          </button>
        </form>

        {status && (
          <p style={{ marginTop: "15px", textAlign: "center", color: "#555" }}>
            {status}
          </p>
        )}
      </div>
    </div>
  );
}

export default Contact;
