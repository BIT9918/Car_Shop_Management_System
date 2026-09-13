import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCars, deleteCar, updateCar } from "../../services/carService";
import api from "../../services/api";
import AddCar from "./Add";
import { FaRegUserCircle } from "react-icons/fa";
import { IMG_BASE } from "../../config/api";

function MainList() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editCar, setEditCar] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editImage, setEditImage] = useState(null);  // File object
  const [editPreview, setEditPreview] = useState(null); // local preview URL
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch {
      /* token may already be expired */
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const fetchCars = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCars();
      setCars(data || []);
    } catch (err) {
      setError(err.message || "Failed to connect to API");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);


  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this car?")) return;

    try {
      await deleteCar(id);
      setCars(cars.filter((car) => car.id !== id));
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const openEdit = (car) => {
    setEditCar(car);
    setEditForm({
      name: car.name,
      brand: car.brand,
      price: car.price,
      year: car.year,
      description: car.description,
      stock: car.stock,
      status: car.status,
    });
    setEditImage(null);
    setEditPreview(null);
  };

  const closeEdit = () => {
    setEditCar(null);
    setEditForm({});
    setEditImage(null);
    setEditPreview(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditImage(file);
      setEditPreview(URL.createObjectURL(file));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("name", editForm.name);
      formData.append("brand", editForm.brand);
      formData.append("price", Number(editForm.price));
      formData.append("year", Number(editForm.year));
      formData.append("description", editForm.description);
      formData.append("stock", Number(editForm.stock));
      formData.append("status", Number(editForm.status));

      // Only append image if a new one was selected
      if (editImage) {
        formData.append("image", editImage);
      }

      await updateCar(editCar.id, formData);
      await fetchCars(); // Refresh to get updated image URL
      closeEdit();
    } catch (err) {
      alert("Update failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">

      <header className="border-b border-white/10 backdrop-blur-md bg-white/5">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Car Shop Management
            </h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAdd(true)}
              className="px-5 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30 transition-all duration-200 text-sm font-medium"
            >
              Add Car
            </button>
            <button
              onClick={fetchCars}
              className="px-5 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/30 transition-all duration-200 text-sm font-medium"
            >
              Refresh
            </button>
            <button
              onClick={() => navigate("/dashboard/history")}
              className="px-5 py-2.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition-all duration-200 text-sm font-medium"
            >
              History
            </button>
            <button
              onClick={() => navigate("/dashboard/orders")}
              className="px-5 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30 transition-all duration-200 text-sm font-medium"
            >
              Purchases
            </button>
            <a href="/user" className="px-3 py-2.5 rounded-xl bg-gray-500/20 border border-gray-500/30 text-white hover:bg-gray-500/30 transition-all duration-200 text-sm font-medium">View User</a>
            <div className="flex items-center gap-3 ml-2 pl-4 border-l border-white/10">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  <FaRegUserCircle size={33}/>
                </span>
              </div>
              <span className="text-sm text-slate-300 hidden sm:block">{user?.name || "Admin"}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 transition-all duration-200 text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        <div className={`mb-6 px-5 py-4 rounded-2xl border backdrop-blur-sm flex items-center gap-3 ${error ?
          "bg-red-500/10 border-red-500/30 text-red-300" : loading ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-300" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"}`}>
          <span className={`inline-block w-3 h-3 rounded-full ${error ? "bg-red-400" : loading ? "bg-yellow-400 animate-pulse" : "bg-emerald-400"}`} />
          <span className="font-medium">
            {error
              ? `API Error: ${error}`
              : loading
              ? "Connecting..."
              : `Connected — ${cars.length} car(s) loaded from API`}
          </span>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-16">
            <p className="text-lg text-slate-300 mb-2">Could not connect to the Laravel API</p>
            <button
              onClick={fetchCars}
              className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition"
            >
              Retry Connection
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/5 text-slate-300 text-xs uppercase tracking-wider">
                    <th className="px-5 py-4 text-left">Name</th>
                    <th className="px-5 py-4 text-left">Brand</th>
                    <th className="px-5 py-4 text-right">Price</th>
                    <th className="px-5 py-4 text-center">Year</th>
                    <th className="px-5 py-4 text-left">Description</th>
                    <th className="px-5 py-4 text-center">Image</th>
                    <th className="px-5 py-4 text-center">Stock</th>
                    <th className="px-5 py-4 text-center">Status</th>
                    <th className="px-5 py-4 text-center">Created</th>
                    <th className="px-5 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {cars.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="px-5 py-12 text-center text-slate-500">
                        No cars found. Waitng for Laravel API...
                      </td>
                    </tr>
                  ) : (
                    cars.map((car) => (
                      <tr key={car.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-5 py-4 font-semibold text-white">{car.name}</td>
                        <td className="px-5 py-4">
                          <span className="px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-300 text-xs font-medium">
                            {car.brand}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right font-mono text-emerald-400">
                          ${Number(car.price).toLocaleString()}
                        </td>
                        <td className="px-5 py-4 text-center text-slate-300">{car.year}</td>
                        <td className="px-5 py-4 text-slate-400 max-w-[200px]">{car.description}</td>

                        {/* Car Image */}
                        <td className="px-5 py-4 text-center">
                          <img
                            src={
                              car.image
                                ? `${IMG_BASE}${car.image}`
                                : "https://placehold.co/50x50/1e293b/64748b?text=No+Img"
                            }
                            alt={car.name}
                            className="w-12 h-12 rounded-lg object-cover border border-white/10 mx-auto"
                          />
                        </td>

                        <td className="px-5 py-4 text-center">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                            car.stock > 3 ? "bg-emerald-500/15 text-emerald-300"
                            : car.stock > 1 ? "bg-yellow-500/15 text-yellow-300"
                            : "bg-red-500/15 text-red-300"
                          }`}>
                            {car.stock}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                            car.status ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${car.status ? "bg-emerald-400" : "bg-red-400"}`} />
                            {car.status ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center text-slate-400 text-xs">
                          {new Date(car.created_at).toLocaleDateString()}
                        </td>

                        <td className="px-5 py-4 text-center flex gap-2 justify-center">
                          <button
                            onClick={() => openEdit(car)}
                            className="px-3 py-1.5 rounded-lg bg-blue-500/15 text-blue-300 hover:bg-blue-500/25 transition text-xs font-medium"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => handleDelete(car.id)}
                            className="px-3 py-1.5 rounded-lg bg-red-500/15 text-red-300 hover:bg-red-500/25 transition text-xs font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
      
      {/* ─── Edit Modal ─── */}
      {editCar && (
        <>
          <div onClick={closeEdit} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <form
              onSubmit={handleEditSubmit}
              className="bg-slate-800 border border-white/10 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-xl font-bold text-white mb-2">Edit Car #{editCar.id}</h2>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Name</label>
                <input name="name" value={editForm.name} onChange={handleEditChange}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-white/10 text-white focus:outline-none focus:border-cyan-500" />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Brand</label>
                <input name="brand" value={editForm.brand} onChange={handleEditChange}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-white/10 text-white focus:outline-none focus:border-cyan-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Price</label>
                  <input name="price" type="number" value={editForm.price} onChange={handleEditChange}
                    className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-white/10 text-white focus:outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Year</label>
                  <input name="year" type="number" value={editForm.year} onChange={handleEditChange}
                    className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-white/10 text-white focus:outline-none focus:border-cyan-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Description</label>
                <textarea name="description" value={editForm.description} onChange={handleEditChange} rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-white/10 text-white focus:outline-none focus:border-cyan-500 resize-none" />
              </div>

              {/* Image Upload with Preview */}
              <div>
                <label className="block text-sm text-slate-400 mb-1">Image</label>
                <input
                  type="file"
                  accept="image/jpg,image/jpeg,image/png"
                  onChange={handleEditImageChange}
                  className="w-full text-sm text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-500/20 file:text-cyan-300 file:font-medium file:cursor-pointer hover:file:bg-cyan-500/30 transition"
                />
                {/* Show: new preview → existing DB image → nothing */}
                {(editPreview || editCar?.image) && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-white/10 bg-slate-700/50 p-2">
                    <img
                      src={
                        editPreview
                          ? editPreview
                          : editCar?.image
                          ? `${IMG_BASE}${editCar.image}`
                          : ""
                      }
                      alt="Car"
                      className="w-full max-h-40 object-contain rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Stock</label>
                  <input name="stock" type="number" value={editForm.stock} onChange={handleEditChange}
                    className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-white/10 text-white focus:outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Status</label>
                  <select name="status" value={editForm.status} onChange={handleEditChange}
                    className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-white/10 text-white focus:outline-none focus:border-cyan-500">
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition disabled:opacity-50">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button type="button" onClick={closeEdit}
                  className="flex-1 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </>
      )}
      {showAdd && (
        <AddCar
          onClose={() => setShowAdd(false)}
          onAdded={fetchCars}
        />
      )}
    </div>
  );
}

export default MainList;
