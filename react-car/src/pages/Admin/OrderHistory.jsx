import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const IMG_BASE = "http://127.0.0.1:8000/storage/cars/";

function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [openOrder, setOpenOrder] = useState(null);

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

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;

    return orders.filter((order) => {
      const userText = `${order.user_name || ""} ${order.user_email || ""} ${order.order_number || ""}`.toLowerCase();
      const itemText = (order.items || [])
        .map((item) => `${item.car_name} ${item.car_brand}`)
        .join(" ")
        .toLowerCase();

      return userText.includes(q) || itemText.includes(q);
    });
  }, [orders, search]);

  const summary = useMemo(
    () => ({
      orders: orders.length,
      quantity: orders.reduce((sum, order) => sum + Number(order.total_quantity || 0), 0),
      revenue: orders.reduce((sum, order) => sum + Number(order.total_price || 0), 0),
    }),
    [orders]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <header className="border-b border-white/10 backdrop-blur-md bg-white/5">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
              Purchase History
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              User orders, purchased cars, price, quantity, and stock movement
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchOrders}
              className="px-5 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/30 transition text-sm font-medium"
            >
              Refresh
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition text-sm font-medium"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-wider text-slate-400">Orders</p>
            <p className="text-3xl font-bold mt-1">{summary.orders}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-wider text-slate-400">Cars Sold</p>
            <p className="text-3xl font-bold mt-1">{summary.quantity}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-wider text-slate-400">Revenue</p>
            <p className="text-3xl font-bold mt-1 text-emerald-300">
              ${summary.revenue.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search buyer, email, order number, car, brand..."
            className="w-full sm:max-w-md px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <div
            className={`px-5 py-3 rounded-xl border text-sm ${
              error
                ? "bg-red-500/10 border-red-500/30 text-red-300"
                : loading
                ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-300"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
            }`}
          >
            {error ? error : loading ? "Loading purchases..." : `${filteredOrders.length} record(s) found`}
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-16 rounded-2xl border border-white/10 bg-white/5 text-slate-400">
                No purchase history found.
              </div>
            ) : (
              filteredOrders.map((order) => {
                const isOpen = openOrder === order.id;

                return (
                  <div key={order.id} className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                    <button
                      onClick={() => setOpenOrder(isOpen ? null : order.id)}
                      className="w-full px-5 py-4 text-left hover:bg-white/5 transition"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
                        <div>
                          <p className="font-bold text-white">{order.order_number}</p>
                          <p className="text-sm text-slate-400 mt-1">
                            {order.user_name} - {order.user_email}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {order.customer_phone || "No phone"} - {order.delivery_method === "delivery" ? "Delivery" : "Pickup"}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-slate-500">Items</p>
                            <p className="font-semibold">{order.total_quantity}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Total</p>
                            <p className="font-semibold text-emerald-300">
                              ${Number(order.total_price).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500">Payment</p>
                            <p className="font-semibold">{order.payment_method}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Date</p>
                            <p className="font-semibold">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>

                    {isOpen && (
                      <div className="border-t border-white/10">
                        <div className="grid md:grid-cols-3 gap-3 p-5 bg-white/[0.02] border-b border-white/10 text-sm">
                          <div>
                            <p className="text-slate-500">Phone</p>
                            <p className="font-semibold text-white mt-1">{order.customer_phone || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Address</p>
                            <p className="font-semibold text-white mt-1">{order.customer_address || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Map / Note</p>
                            <div className="mt-1 space-y-1">
                              {order.customer_location ? (
                                <a
                                  href={order.customer_location}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-semibold text-cyan-300 hover:text-cyan-200"
                                >
                                  Open map
                                </a>
                              ) : (
                                <p className="font-semibold text-white">No map</p>
                              )}
                              {order.customer_note && (
                                <p className="text-slate-300">{order.customer_note}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-white/5 text-slate-300 text-xs uppercase tracking-wider">
                                <th className="px-5 py-3 text-left">Car</th>
                                <th className="px-5 py-3 text-left">Brand</th>
                                <th className="px-5 py-3 text-right">Price</th>
                                <th className="px-5 py-3 text-center">Qty</th>
                                <th className="px-5 py-3 text-center">Stock Before</th>
                                <th className="px-5 py-3 text-center">Stock After</th>
                                <th className="px-5 py-3 text-right">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {(order.items || []).map((item) => (
                                <tr key={item.id}>
                                  <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                      <img
                                        src={
                                          item.car_image
                                            ? `${IMG_BASE}${item.car_image}`
                                            : "https://placehold.co/48x48/1e293b/64748b?text=Car"
                                        }
                                        alt={item.car_name}
                                        className="w-12 h-12 rounded-lg object-cover border border-white/10"
                                      />
                                      <span className="font-semibold">{item.car_name}</span>
                                    </div>
                                  </td>
                                  <td className="px-5 py-4 text-slate-300">{item.car_brand}</td>
                                  <td className="px-5 py-4 text-right text-emerald-300">
                                    ${Number(item.price).toLocaleString()}
                                  </td>
                                  <td className="px-5 py-4 text-center">{item.quantity}</td>
                                  <td className="px-5 py-4 text-center">{item.stock_before}</td>
                                  <td className="px-5 py-4 text-center">{item.stock_after}</td>
                                  <td className="px-5 py-4 text-right font-semibold">
                                    ${Number(item.subtotal).toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
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
    </div>
  );
}

export default OrderHistory;
