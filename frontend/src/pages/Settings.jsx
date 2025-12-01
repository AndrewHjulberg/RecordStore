// SettingsPage.jsx
import { useState } from "react";

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("account");

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
          {/* ACCOUNT SETTINGS PLACEHOLDER */}
          {activeSection === "account" && (
            <div className="flex flex-col gap-6">
              <div className="border p-4 rounded-lg border-black">
                <h2 className="text-2xl font-semibold mb-4">Change Email</h2>
                <p>Placeholder for change email form</p>
              </div>

              <div className="border p-4 rounded-lg border-black">
                <h2 className="text-2xl font-semibold mb-4">Change Password</h2>
                <p>Placeholder for change password form</p>
              </div>
            </div>
          )}

          {/* SHIPPING ADDRESSES PLACEHOLDER */}
          {activeSection === "address" && (
            <div className="border p-4 rounded-lg border-black">
              <h2 className="text-2xl font-semibold mb-4">Shipping Addresses</h2>
              <p>Placeholder for adding, editing, and deleting shipping addresses</p>
            </div>
          )}

          {/* EMAIL NOTIFICATIONS PLACEHOLDER */}
          {activeSection === "notifications" && (
            <div className="border p-4 rounded-lg border-black">
              <h2 className="text-2xl font-semibold mb-4">Email Notifications</h2>
              <p>Placeholder for email notification preferences</p>
            </div>
          )}

          {/* DELETE ACCOUNT PLACEHOLDER */}
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

