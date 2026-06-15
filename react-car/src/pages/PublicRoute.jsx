import { Navigate } from "react-router-dom";

function PublicRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  /* Ber login hx auto */
  if (token && user) {
    if (user.role === "admin") return <Navigate to="/dashboard" />;
    return <Navigate to="/user" />;
  }

  return children;
}

export default PublicRoute;
