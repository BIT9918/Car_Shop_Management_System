import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { FaCheckCircle, FaReceipt, FaArrowRight, FaShoppingBag, FaMapMarkerAlt } from "react-icons/fa";

const SHOP_LOCATION_URL = "https://maps.app.goo.gl/xkCBefrsdZy4eWG57";

function CheckOut() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [orderStatus, setOrderStatus] = useState("idle");
  const [orderError, setOrderError] = useState("");
  const orderSubmittedRef = useRef(false);

  const submitOrder = (cart) => {
    if (cart.length === 0 || orderSubmittedRef.current) return;

    const customer = JSON.parse(localStorage.getItem("checkoutCustomer")) || {};

    orderSubmittedRef.current = true;
    setOrderStatus("saving");
    setOrderError("");

    api
      .post("/orders", {
        items: cart.map((item) => ({
          id: item.id,
          quantity: item.quantity,
        })),
        customer,
      })
      .then(() => {
        setOrderStatus("success");
        localStorage.removeItem("cart");
        localStorage.removeItem("checkoutCustomer");
        window.dispatchEvent(new Event("cartUpdated"));
      })
      .catch((err) => {
        orderSubmittedRef.current = false;
        setOrderStatus("error");
        setOrderError(
          err.response?.data?.message ||
            "Payment succeeded, but stock could not be updated. Please contact admin."
        );
      });
  };

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    setItems(cart);
    submitOrder(cart);
  }, []);

  const calculateTotals = () => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shipping = 0;
    const total = subtotal + shipping;
    return { subtotal, shipping, total };
  };

  const { subtotal, shipping, total } = calculateTotals();

  const fakeOrderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
  const fakeDate = new Date().toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const handleShowReceipt = () => {
    if (orderStatus !== "success") return;
    setShowReceipt(true);
  };

  const handleFinish = () => {
    navigate("/user/products");
  };

  // ─── NO ITEMS ───
  if (items.length === 0 && !showReceipt) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="text-center animate-fade-in-up">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <FaShoppingBag className="text-2xl text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No Recent Purchase
          </h2>
          <p className="text-gray-500 mb-6">
            Start shopping to see your order here.
          </p>
          <button
            onClick={() => navigate("/user/products")}
            className="px-8 py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-all shadow-lg shadow-blue-600/25"
          >
            Browse Vehicles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 py-10 px-4 sm:px-6 lg:px-8">
      {!showReceipt ? (
        // ═══ SUCCESS CELEBRATION ═══
        <div className="max-w-lg mx-auto text-center animate-fade-in-up">
          <div className="mb-8">
            {/* Animated checkmark */}
            <div className="relative inline-flex">
              <div className="w-28 h-28 bg-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-100">
                <FaCheckCircle className="text-6xl text-emerald-500" />
              </div>
              <div className="absolute -inset-2 rounded-full border-2 border-emerald-200 animate-ping opacity-20"></div>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-8 mb-3">
              Payment Successful!
            </h1>
            <p className="text-lg text-gray-600">
              Your vehicle order is being prepared for delivery 🎉
            </p>
          </div>

          {/* Order info card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span>Order ID</span>
              <span className="font-mono font-semibold text-gray-800">
                {fakeOrderId}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Date</span>
              <span className="text-gray-800">{fakeDate}</span>
            </div>
          </div>

          {orderStatus === "saving" && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-2xl px-5 py-4 mb-6 text-sm font-medium">
              Updating stock for your order...
            </div>
          )}

          {orderStatus === "success" && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl px-5 py-4 mb-6 text-sm font-medium space-y-3">
              <p>Stock updated successfully.</p>
              <a
                href={SHOP_LOCATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-800 font-semibold"
              >
                <FaMapMarkerAlt />
                View shop location
              </a>
            </div>
          )}

          {orderStatus === "error" && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 mb-6 text-sm font-medium space-y-3">
              <p>{orderError}</p>
              <button
                onClick={() => submitOrder(items)}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition"
              >
                Retry Stock Update
              </button>
            </div>
          )}

          <button
            onClick={handleShowReceipt}
            disabled={orderStatus !== "success"}
            className="w-full max-w-md py-4 px-8 text-lg font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-xl hover:shadow-2xl transform transition-all hover:scale-[1.02] flex items-center justify-center gap-3 mx-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <FaReceipt />
            View Detailed Receipt
            <FaArrowRight className="text-sm" />
          </button>
        </div>
      ) : (
        // ═══ DETAILED RECEIPT ═══
        <div className="max-w-2xl mx-auto animate-fade-in-up">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">

            {/* Receipt Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

              <div className="relative">
                <FaReceipt className="text-3xl mx-auto mb-3 opacity-80" />
                <h2 className="text-2xl font-bold mb-1">Your Receipt</h2>
                <p className="text-emerald-100 text-sm">
                  Order #{fakeOrderId} • {fakeDate}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 rounded-full text-sm font-medium">
                  <FaCheckCircle className="text-xs" />
                  Payment Confirmed
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="p-6 md:p-8">
              <div className="space-y-0">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 py-5 border-b border-gray-100 last:border-0 animate-fade-in"
                    style={{
                      animationDelay: `${index * 0.1}s`,
                      animationFillMode: "both",
                    }}
                  >
                    {/* Image */}
                    <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 flex items-center justify-center">
                      <img
                        src={
                          item.image
                            ? `http://127.0.0.1:8000/storage/cars/${item.image}`
                            : "https://placehold.co/80x80/f3f4f6/9ca3af?text=No+Image"
                        }
                        alt={item.name}
                        className="max-h-full object-contain p-1"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {item.name}
                      </h3>
                      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                        <span>
                          ${Number(item.price).toLocaleString()} × {item.quantity}
                        </span>
                      </div>
                    </div>

                    {/* Item total */}
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        ${(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="bg-gray-50 px-6 md:px-8 py-6 border-t border-gray-200">
              <div className="max-w-sm ml-auto space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-4 border-t border-gray-200">
                  <span>Grand Total</span>
                  <span>${total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 text-center bg-white border-t border-gray-100">
              <p className="text-gray-500 mb-6 text-sm">
                Thank you for your purchase! A digital copy has been sent to
                your email.
              </p>

              <a
                href={SHOP_LOCATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full max-w-md mb-3 mx-auto py-3.5 border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <FaMapMarkerAlt />
                View Shop Location
              </a>

              <button
                onClick={handleFinish}
                className="w-full max-w-md py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-xl"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CheckOut;
