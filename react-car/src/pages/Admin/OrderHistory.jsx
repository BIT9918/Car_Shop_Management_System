import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaReceipt,
  FaCar,
  FaDollarSign,
  FaSyncAlt,
  FaArrowLeft,
  FaChevronDown,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaTruck,
  FaStore,
  FaExternalLinkAlt,
  FaCheck,
  FaRegCopy,
  FaQrcode,
  FaCalendarAlt,
  FaBoxOpen,
  FaTimes,
  FaPrint,
  FaClock,
  FaShieldAlt,
} from "react-icons/fa";
import api from "../../services/api";
import { IMG_BASE } from "../../config/api";

function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deliveryFilter, setDeliveryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [openOrder, setOpenOrder] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [receiptModalOrder, setReceiptModalOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/orders");
      setOrders(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load purchase history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Filter by delivery method
    if (deliveryFilter !== "all") {
      result = result.filter(
        (o) => (o.delivery_method || "pickup").toLowerCase() === deliveryFilter
      );
    }

    // Filter by search query
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((order) => {
        const userText = `${order.user_name || ""} ${order.user_email || ""} ${
          order.customer_phone || ""
        } ${order.customer_address || ""} ${order.order_number || ""}`.toLowerCase();
        const itemText = (order.items || [])
          .map((item) => `${item.car_name} ${item.car_brand}`)
          .join(" ")
          .toLowerCase();

        return userText.includes(q) || itemText.includes(q);
      });
    }

    // Sorting
    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    } else if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
    } else if (sortBy === "highest") {
      result.sort((a, b) => Number(b.total_price || 0) - Number(a.total_price || 0));
    } else if (sortBy === "lowest") {
      result.sort((a, b) => Number(a.total_price || 0) - Number(b.total_price || 0));
    }

    return result;
  }, [orders, search, deliveryFilter, sortBy]);

  const summary = useMemo(() => {
    const totalOrders = orders.length;
    const totalQuantity = orders.reduce((sum, order) => sum + Number(order.total_quantity || 0), 0);
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_price || 0), 0);
    const pickupCount = orders.filter((o) => (o.delivery_method || "pickup").toLowerCase() === "pickup").length;
    const deliveryCount = orders.filter((o) => (o.delivery_method || "").toLowerCase() === "delivery").length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      orders: totalOrders,
      quantity: totalQuantity,
      revenue: totalRevenue,
      pickupCount,
      deliveryCount,
      avgOrderValue,
    };
  }, [orders]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* ─── Top Header ─── */}
      <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-xl shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-black text-xl">
              <FaReceipt />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Purchase History
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <FaShieldAlt className="text-[10px]" /> Admin Console
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Real-time record of customer vehicle orders, sales revenue, and inventory stock tracking
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 hover:text-white transition flex items-center gap-2 text-xs sm:text-sm font-semibold cursor-pointer shadow-sm disabled:opacity-50"
            >
              <FaSyncAlt className={`text-xs ${loading ? "animate-spin text-blue-400" : ""}`} />
              Refresh
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition flex items-center gap-2 text-xs sm:text-sm font-semibold cursor-pointer shadow-md shadow-blue-600/30"
            >
              <FaArrowLeft className="text-xs" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ─── Top 4 Executive KPI Metrics Cards ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Revenue */}
          <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-slate-900/90 to-slate-950 p-5 shadow-lg backdrop-blur-xl group hover:border-emerald-500/40 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Revenue</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-base shadow-sm">
                <FaDollarSign />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-3 tracking-tight">
              ${summary.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className="flex items-center justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-white/5">
              <span>Verified Sales</span>
              <span className="text-emerald-400/90 font-medium">Avg ${Math.round(summary.avgOrderValue).toLocaleString()} / order</span>
            </div>
          </div>

          {/* Orders */}
          <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-b from-slate-900/90 to-slate-950 p-5 shadow-lg backdrop-blur-xl group hover:border-blue-500/40 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Orders</span>
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center text-base shadow-sm">
                <FaReceipt />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white mt-3 tracking-tight">
              {summary.orders}
            </p>
            <div className="flex items-center justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-white/5">
              <span>Completion Rate</span>
              <span className="text-blue-400 font-semibold">100% Paid</span>
            </div>
          </div>

          {/* Cars Sold */}
          <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-slate-900/90 to-slate-950 p-5 shadow-lg backdrop-blur-xl group hover:border-cyan-500/40 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Cars Sold</span>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center text-base shadow-sm">
                <FaCar />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white mt-3 tracking-tight">
              {summary.quantity} <span className="text-base font-medium text-slate-400">units</span>
            </p>
            <div className="flex items-center justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-white/5">
              <span>Inventory Deducted</span>
              <span className="text-cyan-400 font-medium">In Sync</span>
            </div>
          </div>

          {/* Fulfillment Breakdown */}
          <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-b from-slate-900/90 to-slate-950 p-5 shadow-lg backdrop-blur-xl group hover:border-indigo-500/40 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Fulfillment</span>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-base shadow-sm">
                <FaStore />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white mt-3 tracking-tight">
              {summary.pickupCount} <span className="text-sm font-normal text-slate-400">Pickups</span>
            </p>
            <div className="flex items-center justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-white/5">
              <span>{summary.deliveryCount} Delivery requests</span>
              <span className="text-indigo-400 font-medium">ABA QR</span>
            </div>
          </div>
        </div>

        {/* ─── Search & Filters Control Bar ─── */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search buyer, phone, order number, vehicle, brand..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/60 border border-slate-700/80 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm transition"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer p-1"
                >
                  <FaTimes className="text-xs" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800 self-start sm:self-center">
              <button
                onClick={() => setDeliveryFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  deliveryFilter === "all"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                All Orders ({orders.length})
              </button>
              <button
                onClick={() => setDeliveryFilter("pickup")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                  deliveryFilter === "pickup"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <FaStore className="text-[11px]" /> Store Pickup
              </button>
              <button
                onClick={() => setDeliveryFilter("delivery")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                  deliveryFilter === "delivery"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <FaTruck className="text-[11px]" /> Home Delivery
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end lg:self-center text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="newest" className="bg-slate-900 text-white">Newest First</option>
                <option value="oldest" className="bg-slate-900 text-white">Oldest First</option>
                <option value="highest" className="bg-slate-900 text-white">Highest Amount</option>
                <option value="lowest" className="bg-slate-900 text-white">Lowest Amount</option>
              </select>
            </div>

            <span className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 font-semibold">
              {filteredOrders.length} {filteredOrders.length === 1 ? "Record" : "Records"}
            </span>
          </div>
        </div>

        {/* ─── Loading State ─── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-28">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm text-slate-400 font-medium">Loading purchase records & stock movement...</p>
          </div>
        )}

        {/* ─── Error State ─── */}
        {!loading && error && (
          <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-center my-6 max-w-lg mx-auto">
            <p className="font-bold text-lg mb-1.5">Unable to load orders</p>
            <p className="text-sm text-red-300/80 mb-5">{error}</p>
            <button
              onClick={fetchOrders}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition cursor-pointer shadow-lg shadow-red-600/30"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ─── Orders List ─── */}
        {!loading && !error && (
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-24 rounded-3xl border border-slate-800 bg-slate-900/40 text-slate-400">
                <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center mx-auto mb-4 text-slate-500 text-2xl">
                  <FaBoxOpen />
                </div>
                <p className="text-lg font-bold text-slate-200">No purchase records found</p>
                <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                  {search || deliveryFilter !== "all"
                    ? "Try adjusting your search query or switching filters above"
                    : "Completed orders will automatically appear here once customers make purchases."}
                </p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const isOpen = openOrder === order.id;
                const items = order.items || [];
                const firstItem = items[0];

                return (
                  <div
                    key={order.id}
                    className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                      isOpen
                        ? "border-blue-500/50 bg-slate-900/95 shadow-2xl shadow-blue-950/30"
                        : "border-slate-800/90 bg-slate-900/70 hover:bg-slate-900/90 hover:border-slate-700 shadow-md"
                    }`}
                  >
                    {/* ── Order Header Row ── */}
                    <div className="p-4 sm:p-5 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-3 bg-white/[0.01]">
                      {/* Left: Order ID, Copy button, Status pill, Fulfillment badge */}
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono text-xs sm:text-sm font-bold text-white bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 tracking-tight">
                          {order.order_number}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(order.order_number);
                          }}
                          title="Copy Order ID"
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs transition cursor-pointer flex items-center gap-1.5"
                        >
                          {copiedId === order.order_number ? (
                            <>
                              <FaCheck className="text-emerald-400 text-[10px]" />
                              <span className="text-[11px] text-emerald-400 font-semibold">Copied</span>
                            </>
                          ) : (
                            <>
                              <FaRegCopy className="text-[10px]" />
                              <span className="text-[11px]">Copy</span>
                            </>
                          )}
                        </button>

                        {/* Paid Badge */}
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Paid
                        </span>

                        {/* Fulfillment Badge */}
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                            order.delivery_method === "delivery"
                              ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                              : "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"
                          }`}
                        >
                          {order.delivery_method === "delivery" ? (
                            <FaTruck className="text-xs" />
                          ) : (
                            <FaStore className="text-xs" />
                          )}
                          {order.delivery_method === "delivery" ? "Home Delivery" : "Store Pickup"}
                        </span>

                        {/* Payment Method Badge */}
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/25">
                          <FaQrcode className="text-xs" />
                          {order.payment_method || "ABA QR"}
                        </span>
                      </div>

                      {/* Right: Date & Time */}
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <FaCalendarAlt className="text-slate-500 text-[11px]" />
                        <span>{formatDate(order.created_at)}</span>
                        <span className="text-slate-600">•</span>
                        <FaClock className="text-slate-500 text-[11px]" />
                        <span>{formatTime(order.created_at)}</span>
                      </div>
                    </div>

                    {/* ── Main Order Body (Always visible summary with Vehicle Preview!) ── */}
                    <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                      {/* Section 1: Customer Info */}
                      <div className="flex items-center gap-3.5 min-w-[220px]">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center font-black text-blue-400 text-sm shadow-inner">
                          {(order.user_name || "G")[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white text-sm truncate flex items-center gap-1.5">
                            <FaUser className="text-[10px] text-blue-400 shrink-0" />
                            <span className="truncate">{order.user_name || "Guest Customer"}</span>
                          </p>
                          <p className="text-xs text-slate-400 truncate mt-0.5">{order.user_email}</p>
                          {order.customer_phone && (
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              <FaPhone className="text-[10px] text-slate-500 shrink-0" />
                              <span className="font-mono text-slate-300">{order.customer_phone}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Section 2: Vehicle Preview Strip (Key Feature: See car immediately!) */}
                      <div className="flex-1 bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {firstItem ? (
                          <div className="flex items-center gap-3.5 min-w-0">
                            <img
                              src={
                                firstItem.car_image
                                  ? `${IMG_BASE}${firstItem.car_image}`
                                  : "https://placehold.co/120x80/0f172a/64748b?text=Car"
                              }
                              alt={firstItem.car_name}
                              className="w-16 h-12 rounded-lg object-cover border border-slate-700 bg-slate-900 shrink-0 shadow-sm"
                              onError={(e) => {
                                e.target.src = "https://placehold.co/120x80/0f172a/64748b?text=Car";
                              }}
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-sm sm:text-base truncate">
                                  {firstItem.car_name}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/10 text-slate-300">
                                  {firstItem.car_brand}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 mt-0.5">
                                Unit: <strong className="text-slate-300 font-mono">${Number(firstItem.price).toLocaleString()}</strong>
                                {" • "}
                                Qty: <strong className="text-blue-400 font-semibold">{firstItem.quantity}</strong>
                                {items.length > 1 && (
                                  <span className="ml-2 text-[11px] text-indigo-400 font-medium">
                                    +{items.length - 1} more car{items.length > 2 ? "s" : ""}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">No vehicle item details</span>
                        )}

                        {/* Stock Movement Badge */}
                        {firstItem && (
                          <div className="flex sm:flex-col sm:items-end justify-between items-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                              Stock Tracking
                            </span>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 text-xs font-mono mt-1">
                              <span className="text-slate-400" title="Inventory Before">
                                {firstItem.stock_before}
                              </span>
                              <span className="text-slate-600">→</span>
                              <span
                                className={`font-bold ${
                                  Number(firstItem.stock_after) === 0
                                    ? "text-amber-400"
                                    : "text-emerald-400"
                                }`}
                                title="Inventory After"
                              >
                                {firstItem.stock_after}
                              </span>
                              <span className="text-[11px] text-rose-400 font-medium">
                                (-{firstItem.quantity})
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Section 3: Total Price & Actions */}
                      <div className="flex items-center justify-between lg:justify-end gap-5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/5">
                        <div className="text-left lg:text-right">
                          <p className="text-xs text-slate-400 font-medium">Total Amount</p>
                          <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono tracking-tight">
                            ${Number(order.total_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {order.total_quantity} {order.total_quantity === 1 ? "car" : "cars"} purchased
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setReceiptModalOrder(order)}
                            title="View / Print Receipt"
                            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer text-xs flex items-center gap-1.5"
                          >
                            <FaPrint className="text-xs" />
                            <span className="hidden sm:inline font-semibold">Receipt</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setOpenOrder(isOpen ? null : order.id)}
                            className={`px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                              isOpen
                                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                                : "bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700"
                            }`}
                          >
                            <span>{isOpen ? "Hide Details" : "Details"}</span>
                            <FaChevronDown
                              className={`text-[10px] transition-transform duration-200 ${
                                isOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* ─── Expanded Full Detail Panel ─── */}
                    {isOpen && (
                      <div className="border-t border-slate-800 bg-slate-950/70 p-5 sm:p-6 space-y-6">
                        {/* 1. Customer & Shipping Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Buyer Contact Tile */}
                          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2.5">
                              <FaUser className="text-xs text-blue-400" /> Buyer Contact
                            </p>
                            <p className="text-sm font-bold text-white">{order.user_name || "Guest Customer"}</p>
                            <p className="text-xs text-slate-300 mt-1 font-mono">{order.user_email}</p>
                            <p className="text-xs text-slate-400 mt-1">
                              Phone: <strong className="text-slate-200 font-mono">{order.customer_phone || "Not specified"}</strong>
                            </p>
                          </div>

                          {/* Destination Address Tile */}
                          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2.5">
                              <FaMapMarkerAlt className="text-xs text-rose-400" /> Delivery Address
                            </p>
                            <p className="text-sm font-medium text-white">
                              {order.customer_address || "Store Showroom Pickup Counter"}
                            </p>
                            <p className="text-xs text-slate-400 mt-1.5">
                              Fulfillment:{" "}
                              <span className="font-semibold text-slate-200 capitalize">
                                {order.delivery_method || "pickup"}
                              </span>
                            </p>
                          </div>

                          {/* Coordinates & Note */}
                          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm flex flex-col justify-between">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2.5">
                                <FaExternalLinkAlt className="text-xs text-cyan-400" /> Location & Note
                              </p>
                              {order.customer_location ? (
                                <a
                                  href={order.customer_location}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition"
                                >
                                  <FaMapMarkerAlt /> Open in Google Maps
                                </a>
                              ) : (
                                <p className="text-xs text-slate-500">No map GPS coordinates attached</p>
                              )}
                              {order.customer_note && (
                                <div className="mt-2.5 text-xs bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 text-slate-300 italic">
                                  "{order.customer_note}"
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 2. Purchased Vehicles Breakdown Table */}
                        <div className="rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-sm">
                          <div className="px-5 py-3 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                              <FaCar className="text-blue-400" /> Purchased Vehicle Breakdown
                            </p>
                            <span className="text-xs text-slate-400">
                              {items.length} {items.length === 1 ? "vehicle" : "vehicles"}
                            </span>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                              <thead>
                                <tr className="bg-slate-950/30 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800/80">
                                  <th className="px-5 py-3">Vehicle</th>
                                  <th className="px-5 py-3">Brand</th>
                                  <th className="px-5 py-3 text-right">Unit Price</th>
                                  <th className="px-5 py-3 text-center">Qty</th>
                                  <th className="px-5 py-3 text-center">Stock Movement</th>
                                  <th className="px-5 py-3 text-right">Subtotal</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800/60 font-medium">
                                {items.map((item) => (
                                  <tr key={item.id} className="hover:bg-slate-800/30 transition">
                                    <td className="px-5 py-3.5">
                                      <div className="flex items-center gap-3">
                                        <img
                                          src={
                                            item.car_image
                                              ? `${IMG_BASE}${item.car_image}`
                                              : "https://placehold.co/96x64/0f172a/64748b?text=Car"
                                          }
                                          alt={item.car_name}
                                          className="w-14 h-10 rounded-lg object-cover border border-slate-700 bg-slate-950 shadow-sm"
                                          onError={(e) => {
                                            e.target.src = "https://placehold.co/96x64/0f172a/64748b?text=Car";
                                          }}
                                        />
                                        <span className="font-bold text-white text-sm">
                                          {item.car_name}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                                      <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-300">
                                        {item.car_brand}
                                      </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-right font-mono text-slate-300">
                                      ${Number(item.price).toLocaleString()}
                                    </td>
                                    <td className="px-5 py-3.5 text-center">
                                      <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 font-bold text-xs">
                                        {item.quantity}
                                      </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-center">
                                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
                                        <span className="text-slate-400" title="Stock before purchase">
                                          {item.stock_before}
                                        </span>
                                        <span className="text-slate-600">→</span>
                                        <span
                                          className={`font-bold ${
                                            Number(item.stock_after) === 0
                                              ? "text-amber-400"
                                              : "text-emerald-400"
                                          }`}
                                          title="Stock after purchase"
                                        >
                                          {item.stock_after}
                                        </span>
                                        <span className="text-[11px] text-rose-400">
                                          (-{item.quantity})
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-5 py-3.5 text-right font-bold text-emerald-400 font-mono text-sm">
                                      ${Number(item.subtotal).toLocaleString()}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* 3. Footer Summary & Receipt Action */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                          <p className="text-xs text-slate-400">
                            Transaction verified via <strong className="text-slate-200">{order.payment_method || "ABA QR"}</strong> • Status: <strong className="text-emerald-400">Paid in Full</strong>
                          </p>
                          <button
                            type="button"
                            onClick={() => setReceiptModalOrder(order)}
                            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition shadow-sm"
                          >
                            <FaPrint className="text-xs text-blue-400" />
                            Print Official Receipt
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {/* ─── Official Receipt Modal ─── */}
      {receiptModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white text-base font-black">
                  <FaCar />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">CAR SHOP</h3>
                  <p className="text-xs text-slate-400">Sales Invoice & Customer Receipt</p>
                </div>
              </div>
              <button
                onClick={() => setReceiptModalOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Top Details */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-800 text-xs">
                <div>
                  <p className="text-slate-400 font-medium">Billed To:</p>
                  <p className="text-sm font-bold text-white mt-1">{receiptModalOrder.user_name || "Guest Customer"}</p>
                  <p className="text-slate-300 mt-0.5">{receiptModalOrder.user_email}</p>
                  <p className="text-slate-400 mt-0.5">Phone: {receiptModalOrder.customer_phone || "N/A"}</p>
                  <p className="text-slate-400 mt-0.5">
                    Address: {receiptModalOrder.customer_address || "Showroom Pickup"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 font-medium">Invoice Number:</p>
                  <p className="text-sm font-mono font-bold text-blue-400 mt-1">{receiptModalOrder.order_number}</p>
                  <p className="text-slate-400 mt-1">Date: {formatDate(receiptModalOrder.created_at)}</p>
                  <p className="text-slate-400 mt-0.5">Payment: {receiptModalOrder.payment_method || "ABA QR"}</p>
                  <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    PAID IN FULL
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Ordered Vehicles
                </p>
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2">Vehicle</th>
                      <th className="py-2">Brand</th>
                      <th className="py-2 text-right">Price</th>
                      <th className="py-2 text-center">Qty</th>
                      <th className="py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {(receiptModalOrder.items || []).map((item) => (
                      <tr key={item.id} className="text-slate-200">
                        <td className="py-2.5 font-bold text-white">{item.car_name}</td>
                        <td className="py-2.5 text-slate-400">{item.car_brand}</td>
                        <td className="py-2.5 text-right font-mono">${Number(item.price).toLocaleString()}</td>
                        <td className="py-2.5 text-center font-bold text-blue-400">{item.quantity}</td>
                        <td className="py-2.5 text-right font-mono font-bold text-emerald-400">
                          ${Number(item.subtotal).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Calculation */}
              <div className="pt-4 border-t border-slate-800 space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono text-white">${Number(receiptModalOrder.total_price).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span className="text-emerald-400 font-semibold">$0.00 (Complimentary)</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-800 text-sm font-bold text-white">
                  <span>Total Paid:</span>
                  <span className="font-mono text-base text-emerald-400">
                    ${Number(receiptModalOrder.total_price).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
              <p className="text-[11px] text-slate-500">Official proof of purchase generated by CAR SHOP</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition shadow-md shadow-blue-600/30"
                >
                  <FaPrint className="text-xs" />
                  Print
                </button>
                <button
                  onClick={() => setReceiptModalOrder(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderHistory;
