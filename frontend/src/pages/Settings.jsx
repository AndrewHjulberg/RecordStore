// SettingsPage.jsx
import { useState } from "react";

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("account");

  // === Change Email ===
  const [newEmail, setNewEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");

  const menuItem = (key, label) => (
    <button
      onClick={() => setActiveSection(key)}
      className={`w-full text-left px-4 py-2 border-b border-gray-300 hover:bg-black hover:text-white transition ${
        activeSection === key ? "bg-black text-white" : ""
      }`}
    >
      {label}
    </button>
  );

  // === Handle Email Update ===
  // === Handle Email Update ===
    const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");
    setEmailSuccess("");

    if (!newEmail) {
        setEmailError("Please enter a valid email.");
        return;
    }

    try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/auth/email", { // ✅ updated backend URL
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newEmail }),
        });

        let data = {};
        try {
        data = await res.json();
        } catch {
        console.error("Failed to parse JSON from server.");
        }

        if (!res.ok) {
        setEmailError(data.error || "Failed to update email");
        return;
        }

        // Save updated token
        if (data.token) localStorage.setItem("token", data.token);

        setEmailSuccess("Email updated successfully!");
        setNewEmail("");
    } catch (err) {
        console.error(err);
        setEmailError("Something went wrong");
    }
    };


  return (
    <div className="w-full min-h-screen bg-white text-black flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-8">User Settings</h1>

      <div className="w-full max-w-4xl flex border border-black rounded-xl overflow-hidden shadow-md">
        {/* LEFT MENU */}
        <div className="w-1/3 border-r border-black flex flex-col bg-gray-100">
          {menuItem("account", "Account Settings")}
          {menuItem("address", "Shipping Addresses")}
          {menuItem("notifications", "Email Notifications")}
          {menuItem("delete", "Delete Account")}
        </div>

        {/* RIGHT CONTENT */}
        <div className="w-2/3 p-6">
          {activeSection === "account" && (
            <div className="flex flex-col gap-6">
              {/* Change Email */}
              <div className="border p-4 rounded-lg border-black">
                <h2 className="text-2xl font-semibold mb-4">Change Email</h2>
                <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Enter new email"
                    className="border border-gray-400 p-2 rounded-lg"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-black text-white rounded-lg"
                  >
                    Update Email
                  </button>
                  {emailError && <p className="text-red-600">{emailError}</p>}
                  {emailSuccess && <p className="text-green-600">{emailSuccess}</p>}
                </form>
              </div>

              {/* Placeholder for Change Password */}
              <div className="border p-4 rounded-lg border-black">
                <h2 className="text-2xl font-semibold mb-4">Change Password</h2>
                <p>Placeholder for change password form</p>
              </div>
            </div>
          )}

          {/* Other sections placeholders */}
          {activeSection === "address" && (
            <div className="border p-4 rounded-lg border-black">
              <h2 className="text-2xl font-semibold mb-4">Shipping Addresses</h2>
              <p>Placeholder for adding/editing/deleting shipping addresses</p>
            </div>
          )}
          {activeSection === "notifications" && (
            <div className="border p-4 rounded-lg border-black">
              <h2 className="text-2xl font-semibold mb-4">Email Notifications</h2>
              <p>Placeholder for email notification preferences</p>
            </div>
          )}
          {activeSection === "delete" && (
            <div className="border p-4 rounded-lg border-black">
              <h2 className="text-2xl font-semibold mb-4">Delete Account</h2>
              <p>Placeholder for delete account button</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
