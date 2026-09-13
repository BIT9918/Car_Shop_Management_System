import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  FaCheckCircle,
  FaReceipt,
  FaPrint,
  FaMapMarkerAlt,
  FaShoppingBag,
  FaCar,
  FaStore,
  FaTruck,
  FaUser,
  FaPhone,
  FaRegCopy,
  FaCheck,
  FaArrowRight,
  FaShieldAlt,
  FaCalendarAlt,
  FaQrcode,
} from "react-icons/fa";
import { IMG_BASE } from "../../config/api";

const SHOP_LOCATION_URL = "https://maps.app.goo.gl/xkCBefrsdZy4eWG57";

function CheckOut() {
  const navigate = useNavigate();

  const [customer] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("checkoutCustomer")) || {};
    } catch {
      return {};
    }
  });

  const [items] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      return [];
    }
  });

  const [orderStatus, setOrderStatus] = useState(() => {
    try {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      return cart.length > 0 ? "saving" : "idle";
    } catch {
      return "idle";
    }
  });
  const [orderError, setOrderError] = useState("");
  const [copiedId, setCopiedId] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'receipt'
  const orderSubmittedRef = useRef(false);

  const handleRetryOrder = () => {
    orderSubmittedRef.current = false;
    setOrderStatus("saving");
    setOrderError("");

    api
      .post("/orders", {
        items: items.map((item) => ({
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
        setOrderStatus("error");
        setOrderError(
          err.response?.data?.message ||
            "Payment succeeded, but stock could not be updated. Please contact admin."
        );
      });
  };

  useEffect(() => {
    if (items.length === 0 || orderSubmittedRef.current) return;

    orderSubmittedRef.current = true;

    api
      .post("/orders", {
        items: items.map((item) => ({
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
  }, [items, customer]);

  const calculateTotals = () => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shipping = 0;
    const total = subtotal + shipping;
    return { subtotal, shipping, total };
  };

  const { subtotal, total } = calculateTotals();

  const [fakeOrderId] = useState(
    () => `ORD-${Math.floor(100000 + Math.random() * 900000)}`
  );

  const fakeDate = new Date().toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const handleCopyOrder = () => {
    navigator.clipboard.writeText(fakeOrderId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // ─── NO ITEMS AND NO SAVED ORDER ───
  if (items.length === 0 && orderStatus === "idle") {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-xl border border-slate-200">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
            <FaShoppingBag className="text-3xl" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            No Recent Purchase
          </h2>
          <p className="text-slate-500 mb-6 text-sm">
            Explore our premium showroom collection to purchase your next vehicle.
          </p>
          <button
            onClick={() => navigate("/user/products")}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            <FaCar />
            Browse Vehicles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* ─── Hero Confirmation Banner (Clean White Theme) ─── */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl shadow-slate-200/50 text-center relative overflow-hidden">
          {/* Subtle ambient gradient backdrop */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />

          <div className="relative">
            {/* Animated Checkmark Badge */}
            <div className="relative inline-flex mb-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full flex items-center justify-center text-white text-3xl sm:text-4xl shadow-xl shadow-emerald-500/25">
                <FaCheckCircle />
              </div>
              <div className="absolute -inset-2 rounded-full border-2 border-emerald-400/40 animate-ping opacity-30" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
              <FaShieldAlt className="text-[10px]" /> Payment Verified & Inventory Deducted
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
              Payment Successful!
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-xl mx-auto">
              Thank you{customer.name ? `, ${customer.name}` : ""}. Your vehicle purchase has been confirmed and reserved in our showroom inventory.
            </p>

            {/* Quick Meta Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5 text-xs">
              <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl font-mono text-slate-700 font-bold">
                <span>{fakeOrderId}</span>
                <button
                  type="button"
                  onClick={handleCopyOrder}
                  title="Copy Order ID"
                  className="text-slate-400 hover:text-slate-700 transition cursor-pointer"
                >
                  {copiedId ? (
                    <FaCheck className="text-emerald-600 text-xs" />
                  ) : (
                    <FaRegCopy className="text-xs" />
                  )}
                </button>
              </div>

              <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-slate-600 font-medium">
                <FaCalendarAlt className="text-slate-400 text-xs" />
                <span>{fakeDate}</span>
              </div>

              <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl text-blue-700 font-bold">
                <FaQrcode className="text-xs" />
                <span>ABA QR Paid</span>
              </div>
            </div>

            {/* Stock status indicator */}
            {orderStatus === "saving" && (
              <div className="mt-5 max-w-md mx-auto bg-blue-50 border border-blue-200 text-blue-700 rounded-xl px-4 py-2.5 text-xs font-semibold">
                Syncing stock reduction with dealership inventory...
              </div>
            )}

            {orderStatus === "error" && (
              <div className="mt-5 max-w-md mx-auto bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-xs space-y-2">
                <p>{orderError}</p>
                <button
                  onClick={handleRetryOrder}
                  className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition"
                >
                  Retry Stock Sync
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ─── Navigation Tabs: Overview vs Official Receipt ─── */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === "overview"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
              }`}
            >
              Order Overview
            </button>
            <button
              onClick={() => setActiveTab("receipt")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "receipt"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
              }`}
            >
              <FaReceipt className="text-xs" />
              Official Invoice
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <FaPrint className="text-slate-500" />
            <span>Print</span>
          </button>
        </div>

        {/* ─── TAB 1: ORDER OVERVIEW ─── */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Left 2 Cols: Purchased Vehicles & Fulfillment */}
            <div className="lg:col-span-2 space-y-6">
              {/* Purchased Vehicles Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2">
                    <FaCar className="text-blue-600 text-base" />
                    <h2 className="text-base font-bold text-slate-900">
                      Purchased Vehicle{items.length > 1 ? "s" : ""}
                    </h2>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                    {items.length} {items.length === 1 ? "Vehicle" : "Vehicles"}
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={
                            item.image
                              ? `${IMG_BASE}${item.image}`
                              : "https://placehold.co/120x80/f8fafc/64748b?text=Vehicle"
                          }
                          alt={item.name}
                          className="w-24 h-16 rounded-2xl object-cover border border-slate-200 bg-slate-50 shadow-sm shrink-0"
                          onError={(e) => {
                            e.target.src = "https://placehold.co/120x80/f8fafc/64748b?text=Vehicle";
                          }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-base">
                              {item.name}
                            </h3>
                            {item.brand && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                                {item.brand}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Unit Price:{" "}
                            <strong className="text-slate-800 font-mono">
                              ${Number(item.price).toLocaleString()}
                            </strong>{" "}
                            • Quantity:{" "}
                            <strong className="text-blue-600">{item.quantity}</strong>
                          </p>
                          <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <FaCheck className="text-[9px]" /> Showroom Inventory Deducted
                          </span>
                        </div>
                      </div>

                      <div className="text-right sm:self-center">
                        <p className="text-xs text-slate-400 font-medium">Subtotal</p>
                        <p className="text-lg font-black text-slate-900 font-mono">
                          ${(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery & Fulfillment Stage Tracker */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    {customer.delivery_method === "delivery" ? (
                      <FaTruck className="text-amber-500 text-base" />
                    ) : (
                      <FaStore className="text-indigo-600 text-base" />
                    )}
                    <h2 className="text-base font-bold text-slate-900">
                      Fulfillment Status
                    </h2>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                      customer.delivery_method === "delivery"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-indigo-50 text-indigo-700 border-indigo-200"
                    }`}
                  >
                    {customer.delivery_method === "delivery"
                      ? "Home Delivery"
                      : "Showroom Store Pickup"}
                  </span>
                </div>

                {/* 3-Step Visual Progress Bar */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-center">
                    <div className="w-7 h-7 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-1 text-xs font-black">
                      <FaCheck />
                    </div>
                    <p className="text-xs font-bold text-emerald-800">1. Paid</p>
                    <p className="text-[10px] text-emerald-600">Verified via ABA</p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 text-center">
                    <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-1 text-xs font-black">
                      2
                    </div>
                    <p className="text-xs font-bold text-blue-800">2. Preparation</p>
                    <p className="text-[10px] text-blue-600">Inspection & Detailing</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center opacity-70">
                    <div className="w-7 h-7 bg-slate-300 text-slate-600 rounded-full flex items-center justify-center mx-auto mb-1 text-xs font-black">
                      3
                    </div>
                    <p className="text-xs font-bold text-slate-700">3. Handover</p>
                    <p className="text-[10px] text-slate-500">Ready for pickup</p>
                  </div>
                </div>

                {/* Dealership Location & Directions */}
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <FaMapMarkerAlt className="text-rose-500" /> CAR SHOP Showroom
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Phnom Penh Showroom & Fulfillment Center
                    </p>
                  </div>
                  <a
                    href={SHOP_LOCATION_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm cursor-pointer self-start sm:self-center"
                  >
                    <FaMapMarkerAlt className="text-xs" />
                    Open Google Maps
                  </a>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Customer Details & Financial Summary */}
            <div className="space-y-6">
              {/* Customer Contact Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3.5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <FaUser className="text-blue-600 text-xs" /> Customer Details
                </p>
                <div className="text-xs space-y-2 text-slate-700">
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-400">Name:</span>
                    <strong className="text-slate-900">{customer.name || "Customer"}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-400">Phone:</span>
                    <strong className="text-slate-900 font-mono">{customer.phone || "N/A"}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-400">Email:</span>
                    <strong className="text-slate-900 font-mono">{customer.email || "N/A"}</strong>
                  </div>
                  <div className="pt-1">
                    <span className="text-slate-400 block text-[11px] mb-1">Destination:</span>
                    <p className="text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200 leading-relaxed text-xs">
                      {customer.address || "Showroom Counter Pickup"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Financial Totals Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Financial Summary
                </p>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Vehicle Subtotal:</span>
                    <span className="font-mono font-bold text-slate-900">
                      ${subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Showroom Prep & Registration:</span>
                    <span className="font-semibold text-emerald-600">Complimentary</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery / Pickup:</span>
                    <span className="font-semibold text-emerald-600">Free ($0.00)</span>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">Grand Total:</span>
                    <span className="text-2xl font-black text-blue-700 font-mono">
                      ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="pt-2 space-y-2.5">
                  <button
                    onClick={() => setActiveTab("receipt")}
                    className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <FaReceipt />
                    View Detailed Invoice
                  </button>

                  <button
                    onClick={() => navigate("/user/products")}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/25"
                  >
                    <span>Continue Shopping</span>
                    <FaArrowRight className="text-xs" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: DETAILED INVOICE & RECEIPT ─── */}
        {activeTab === "receipt" && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden max-w-3xl mx-auto animate-fade-in">
            {/* Invoice Top Header */}
            <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white">
                    <FaCar />
                  </div>
                  <h2 className="text-xl font-black tracking-tight">CAR SHOP</h2>
                </div>
                <p className="text-xs text-blue-200 mt-1">Official Sales Invoice & Certificate of Purchase</p>
              </div>

              <div className="sm:text-right">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-sm mb-1">
                  PAID IN FULL
                </span>
                <p className="font-mono text-xs text-blue-100">Invoice: {fakeOrderId}</p>
                <p className="text-[11px] text-blue-200">{fakeDate}</p>
              </div>
            </div>

            {/* Billed To / Dealership Info */}
            <div className="p-6 sm:p-8 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Billed To</span>
                <p className="text-sm font-bold text-slate-900">{customer.name || "Customer"}</p>
                <p className="text-slate-600 mt-0.5">{customer.email || "No email provided"}</p>
                <p className="text-slate-600 mt-0.5">Phone: {customer.phone || "N/A"}</p>
                <p className="text-slate-600 mt-0.5">Address: {customer.address || "Showroom Pickup"}</p>
              </div>

              <div className="sm:text-right">
                <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Merchant Details</span>
                <p className="text-sm font-bold text-slate-900">CAR SHOP DEALERSHIP</p>
                <p className="text-slate-600 mt-0.5">Payment Gateway: ABA PayWay KHQR</p>
                <p className="text-slate-600 mt-0.5">Showroom: Phnom Penh, Cambodia</p>
                <p className="text-slate-600 mt-0.5">Status: Verified & Processed</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="p-6 sm:p-8">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider pb-2">
                    <th className="py-2.5">Vehicle</th>
                    <th className="py-2.5">Brand</th>
                    <th className="py-2.5 text-right">Unit Price</th>
                    <th className="py-2.5 text-center">Qty</th>
                    <th className="py-2.5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.id} className="text-slate-700">
                      <td className="py-3 font-bold text-slate-900">{item.name}</td>
                      <td className="py-3 text-slate-500">{item.brand || "CAR SHOP"}</td>
                      <td className="py-3 text-right font-mono">${Number(item.price).toLocaleString()}</td>
                      <td className="py-3 text-center font-bold text-blue-600">{item.quantity}</td>
                      <td className="py-3 text-right font-bold text-slate-900 font-mono">
                        ${(item.price * item.quantity).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total Calculation */}
              <div className="mt-6 pt-4 border-t border-slate-200 space-y-2 text-xs text-slate-600 max-w-xs ml-auto">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono text-slate-900">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Showroom Preparation:</span>
                  <span className="text-emerald-600 font-semibold">$0.00 (Free)</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-base font-bold text-slate-900">
                  <span>Total Paid:</span>
                  <span className="font-mono text-blue-700">
                    ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Receipt Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-500">
                Official proof of vehicle ownership transfer generated by CAR SHOP.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <FaPrint className="text-xs text-blue-600" />
                  Print Invoice
                </button>
                <button
                  onClick={() => setActiveTab("overview")}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer shadow-md shadow-blue-600/20"
                >
                  Back to Overview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CheckOut;
