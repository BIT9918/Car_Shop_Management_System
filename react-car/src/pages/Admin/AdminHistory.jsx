import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaClipboardList, FaPlus, FaEdit, FaTrashAlt, FaChevronDown } from "react-icons/fa";
import api from "../../services/api";

/* ── action config ─────────────────────────────────────────────── */
const ACTION_STYLES = {
  create: {
    bg:    "bg-emerald-500/15",
    text:  "text-emerald-300",
    dot:   "bg-emerald-400",
    badge: "bg-emerald-500/20 border-emerald-500/30 text-emerald-300",
    icon:  <FaPlus className="text-sm" />,
    label: "Created",
  },
  update: {
    bg:    "bg-blue-500/15",
    text:  "text-blue-300",
    dot:   "bg-blue-400",
    badge: "bg-blue-500/20 border-blue-500/30 text-blue-300",
    icon:  <FaEdit className="text-sm" />,
    label: "Updated",
  },
  delete: {
    bg:    "bg-red-500/15",
    text:  "text-red-300",
    dot:   "bg-red-400",
    badge: "bg-red-500/20 border-red-500/30 text-red-300",
    icon:  <FaTrashAlt className="text-sm" />,
    label: "Deleted",
  },
};

/* ── helper: render a key-value data block ─────────────────────── */
function DataBlock({ data, label, accent = "slate" }) {
  if (!data) return null;

  const colorMap = {
    slate:   { heading: "text-slate-400", bg: "bg-white/5", border: "border-white/10" },
    emerald: { heading: "text-emerald-400", bg: "bg-emerald-500/5", border: "border-emerald-500/15" },
    blue:    { heading: "text-blue-400", bg: "bg-blue-500/5", border: "border-blue-500/15" },
    red:     { heading: "text-red-400", bg: "bg-red-500/5", border: "border-red-500/15" },
  };
  const c = colorMap[accent] || colorMap.slate;

  const excluded = ["id", "created_at", "updated_at"];

  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} p-4`}>
      <p className={`text-xs font-semibold uppercase tracking-wider ${c.heading} mb-3`}>
        {label}
      </p>
      <div className="space-y-1.5">
        {Object.entries(data)
          .filter(([key]) => !excluded.includes(key))
          .map(([key, value]) => (
            <div key={key} className="flex items-baseline gap-2 text-sm">
              <span className="text-slate-500 min-w-[90px] capitalize text-xs font-medium">
                {key.replace(/_/g, " ")}
              </span>
              <span className="text-slate-200 font-mono text-xs">
                {value === null ? "—" : String(value)}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

/* ── helper: highlight changed fields ──────────────────────────── */
function DiffView({ oldData, newData }) {
  if (!oldData || !newData) return null;

  const allKeys = [...new Set([...Object.keys(oldData), ...Object.keys(newData)])];
  const excluded = ["id", "created_at", "updated_at"];
  const changedKeys = allKeys.filter(
    (k) => !excluded.includes(k) && JSON.stringify(oldData[k]) !== JSON.stringify(newData[k])
  );

  if (changedKeys.length === 0) {
    return (
      <p className="text-xs text-slate-500 italic py-2">No field changes detected.</p>
    );
  }

  return (
    <div className="rounded-xl border border-blue-500/15 bg-blue-500/5 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-3">
        Changes
      </p>
      <div className="space-y-2">
        {changedKeys.map((key) => (
          <div key={key} className="text-sm">
            <span className="text-slate-400 capitalize text-xs font-medium">
              {key.replace(/_/g, " ")}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-xs text-red-400 line-through bg-red-500/10 px-2 py-0.5 rounded">
                {oldData[key] === null ? "—" : String(oldData[key])}
              </span>
              <span className="text-slate-500">→</span>
              <span className="font-mono text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                {newData[key] === null ? "—" : String(newData[key])}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   AdminHistory — main component
   ═════════════════════════════════════════════════════════════════ */
function AdminHistory() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openRow, setOpenRow] = useState(null);
  const [filter, setFilter] = useState("all"); // all | create | update | delete
  const [search, setSearch] = useState("");

  useEffect(() => {
    api
      .get("/car-history")
      .then((res) => {
        if (res.data.success) setRows(res.data.data);
      })
      .catch((err) => setError(err.message || "Failed to load history"))
      .finally(() => setLoading(false));
  }, []);

  const toggleRow = (id) => setOpenRow(openRow === id ? null : id);

  /* ── derived data ──────────────────────────────────────────── */
  const filtered = rows.filter((r) => {
    if (filter !== "all" && r.action !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      const carName =
        (r.new_data?.name || r.old_data?.name || "").toLowerCase();
      const adminName = (r.user?.name || "").toLowerCase();
      return carName.includes(q) || adminName.includes(q);
    }
    return true;
  });

  const counts = {
    all:    rows.length,
    create: rows.filter((r) => r.action === "create").length,
    update: rows.filter((r) => r.action === "update").length,
    delete: rows.filter((r) => r.action === "delete").length,
  };

  /* ── summary text ─────────────────────────────────────────── */
  const getSummary = (row) => {
    const name = row.new_data?.name || row.old_data?.name || "N/A";
    const brand = row.new_data?.brand || row.old_data?.brand || "";
    const label = brand ? `${name} (${brand})` : name;
    if (row.action === "create") return `Created car: ${label}`;
    if (row.action === "update") return `Updated car: ${label}`;
    if (row.action === "delete") return `Deleted car: ${label}`;
    return label;
  };

  /* ── render ────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* ─── Header ─── */}
      <header className="border-b border-white/10 backdrop-blur-md bg-white/5">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Activity History
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Track every change made to your inventory
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-all duration-200 text-sm font-medium flex items-center gap-2"
          >
            <span>←</span> Back to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* ─── Stats Cards ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { key: "all",    label: "Total",   gradient: "from-slate-500 to-slate-600" },
            { key: "create", label: "Created", gradient: "from-emerald-500 to-emerald-600" },
            { key: "update", label: "Updated", gradient: "from-blue-500 to-blue-600" },
            { key: "delete", label: "Deleted", gradient: "from-red-500 to-red-600" },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => setFilter(s.key)}
              className={`relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300 ${
                filter === s.key
                  ? "border-white/20 bg-white/10 scale-[1.02] shadow-lg"
                  : "border-white/5 bg-white/[0.03] hover:bg-white/5"
              }`}
            >
              <div
                className={`absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br ${s.gradient} opacity-20 blur-xl`}
              />
              <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">
                {s.label}
              </p>
              <p className="text-3xl font-bold text-white">{counts[s.key]}</p>
            </button>
          ))}
        </div>

        {/* ─── Search Bar ─── */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
              <FaSearch className="text-xs" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by car name or admin..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/25 transition-all text-sm"
            />
          </div>
        </div>

        {/* ─── Status Banner ─── */}
        <div
          className={`mb-6 px-5 py-4 rounded-2xl border backdrop-blur-sm flex items-center gap-3 ${
            error
              ? "bg-red-500/10 border-red-500/30 text-red-300"
              : loading
              ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-300"
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
          }`}
        >
          <span
            className={`inline-block w-3 h-3 rounded-full ${
              error
                ? "bg-red-400"
                : loading
                ? "bg-yellow-400 animate-pulse"
                : "bg-emerald-400"
            }`}
          />
          <span className="font-medium text-sm">
            {error
              ? `Error: ${error}`
              : loading
              ? "Loading history..."
              : `${filtered.length} record(s) found`}
          </span>
        </div>

        {/* ─── Loading Spinner ─── */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* ─── History Timeline ─── */}
        {!loading && !error && (
          <div className="space-y-3">
            {filtered.length > 0 ? (
              filtered.map((r) => {
                const style = ACTION_STYLES[r.action] || ACTION_STYLES.update;
                const isOpen = openRow === r.id;

                return (
                  <div
                    key={r.id}
                    className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                      isOpen
                        ? "border-white/15 bg-white/[0.06]"
                        : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10"
                    }`}
                  >
                    {/* Row Header */}
                    <button
                      onClick={() => toggleRow(r.id)}
                      className="w-full flex items-center gap-4 px-6 py-4 text-left cursor-pointer group"
                    >
                      {/* Action icon */}
                      <div
                        className={`w-10 h-10 rounded-xl ${style.bg} flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110`}
                      >
                        <span className={`text-lg ${style.text}`}>
                          {style.icon}
                        </span>
                      </div>

                      {/* Summary */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {getSummary(r)}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          by{" "}
                          <span className="text-slate-400">
                            {r.user?.name || `Admin #${r.user_id}`}
                          </span>
                        </p>
                      </div>

                      {/* Badge */}
                      <span
                        className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${style.badge}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                        {style.label}
                      </span>

                      {/* Date */}
                      <span className="text-xs text-slate-500 hidden md:block whitespace-nowrap">
                        {new Date(r.created_at).toLocaleString()}
                      </span>

                      {/* Chevron */}
                      <span
                        className={`text-slate-500 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      >
                        <FaChevronDown className="text-xs" />
                      </span>
                    </button>

                    {/* Expandable Detail Panel */}
                    {isOpen && (
                      <div className="px-6 pb-5 pt-1 border-t border-white/5 animate-[fadeIn_0.2s_ease]">
                        {/* Mobile date */}
                        <p className="text-xs text-slate-500 mb-4 md:hidden">
                          {new Date(r.created_at).toLocaleString()}
                        </p>

                        {r.action === "create" && (
                          <DataBlock
                            data={r.new_data}
                            label="New Car Data"
                            accent="emerald"
                          />
                        )}

                        {r.action === "update" && (
                          <div className="space-y-4">
                            <DiffView oldData={r.old_data} newData={r.new_data} />
                            <div className="grid md:grid-cols-2 gap-4">
                              <DataBlock
                                data={r.old_data}
                                label="Before"
                                accent="slate"
                              />
                              <DataBlock
                                data={r.new_data}
                                label="After"
                                accent="blue"
                              />
                            </div>
                          </div>
                        )}

                        {r.action === "delete" && (
                          <DataBlock
                            data={r.old_data}
                            label="Deleted Car Data"
                            accent="red"
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500">
                  <FaClipboardList className="text-2xl" />
                </div>
                <p className="text-slate-400 text-lg font-medium">
                  No history records found
                </p>
                <p className="text-slate-500 text-sm mt-1">
                  {filter !== "all"
                    ? "Try changing the filter above"
                    : "Actions will appear here as you manage cars"}
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminHistory;