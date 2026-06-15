import { Routes, Route, Navigate } from "react-router-dom";

/* Pages */
import Login from "../pages/Login";
import Register from "../pages/Register";
import ProtectedRoute from "../pages/ProtectedRoute";
import PublicRoute from "../pages/PublicRoute";

/* Admin */
import MainList from "../pages/Admin/MainList";
import AdminHistory from "../pages/Admin/AdminHistory";
import OrderHistory from "../pages/Admin/OrderHistory";

/* User */
import UserLayout from "../pages/User/UserLayout";
import Home from "../pages/User/Home";
import CarProduct from "../pages/User/CarProduct";
import Cart from "../pages/User/Cart";
import CheckOut from "../pages/User/CheckOut";
import Contact from "../pages/User/Contact";

function AppRoute() {
  return (
    <Routes>
      {/* ─── PUBLIC ROUTES (redirect if already logged in) ─── */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute role="admin">
            <MainList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/history"
        element={
          <ProtectedRoute role="admin">
            <AdminHistory />
          </ProtectedRoute>
        }
      />

      {/* ─── USER ROUTES (role: user) ─── */}
      <Route
        path="/dashboard/orders"
        element={
          <ProtectedRoute role="admin">
            <OrderHistory />
          </ProtectedRoute>
        }
      />

      <Route
        path="/user"
        element={
          <ProtectedRoute role="user">
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="products" element={<CarProduct />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<CheckOut />} />
        <Route path="contact" element={<Contact />} />
      </Route>

      {/* ─── DEFAULT: redirect to login ─── */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default AppRoute;
