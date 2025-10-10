import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = JSON.parse(atob(token.split(".")[1]));
    if (adminOnly && !decoded.isAdmin) {
      return <Navigate to="/" replace />; // redirect non-admins to home
    }
    return children;
  } catch (err) {
    console.error("Invalid token:", err);
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }
}

export default ProtectedRoute;
