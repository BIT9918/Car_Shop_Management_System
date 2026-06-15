import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role || "user";

  /* must login */
  if (!token) return <Navigate to="/login" />;

  /* admin can access everything */
  if (userRole === "admin") return children;

  /* role check */
  if (role && userRole !== role) {
    if (userRole === "admin") return <Navigate to="/dashboard" />;
    return <Navigate to="/user" />;
  }

  return children;
}

export default ProtectedRoute;
