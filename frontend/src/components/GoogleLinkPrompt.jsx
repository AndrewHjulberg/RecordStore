import React from "react";

function GoogleLinkPrompt({ onConfirm, onCancel }) {
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>Account Already Exists</h2>
        <p>
          We found an account with this email that uses a password.  
          Would you like to use Google to log in instead?
        </p>
        <div style={styles.actions}>
          <button onClick={onConfirm} style={styles.confirm}>
            Yes, use Google
          </button>
          <button onClick={onCancel} style={styles.cancel}>
            No, keep password
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex", justifyContent: "center", alignItems: "center",
  },
  modal: {
    background: "#fff",
    padding: "20px",
    borderRadius: "8px",
    width: "400px",
    textAlign: "center",
  },
  actions: { marginTop: "20px", display: "flex", justifyContent: "space-around" },
  confirm: { background: "#4285F4", color: "#fff", padding: "10px 20px", border: "none", borderRadius: "4px" },
  cancel: { background: "#ccc", padding: "10px 20px", border: "none", borderRadius: "4px" },
};

export default GoogleLinkPrompt;