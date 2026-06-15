import React, { useState } from "react";
import { createCar } from "../../services/carService";

const AddCar = ({ onClose, onAdded }) => {
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);

  // Preview does NOT upload - it only shows the image locally
  const handlePreview = (e) => {
    const file = e.target.files[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Use FormData to include the file
    const formData = new FormData(e.target);

    try {
      await createCar(formData);
      alert("Car added successfully!");
      onAdded();
      onClose();
    } catch (err) {
      alert("Failed to add car: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <form
          onSubmit={handleCreate}
          className="bg-slate-800 border border-white/10 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          <h2 className="text-xl font-bold text-white mb-2">Add New Car</h2>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Name</label>
            <input name="name" type="text" required
              className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-white/10 text-white focus:outline-none focus:border-cyan-500" />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Brand</label>
            <input name="brand" type="text" required
              className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-white/10 text-white focus:outline-none focus:border-cyan-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Price</label>
              <input name="price" type="number" required
                className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-white/10 text-white focus:outline-none focus:border-cyan-500" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Year</label>
              <input name="year" type="number" required
                className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-white/10 text-white focus:outline-none focus:border-cyan-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Description</label>
            <textarea name="description" rows={3} required
              className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-white/10 text-white focus:outline-none focus:border-cyan-500 resize-none" />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Image</label>
            <input
              name="image"
              type="file"
              accept="image/jpg,image/jpeg,image/png"
              onChange={handlePreview}
              className="w-full text-sm text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-500/20 file:text-cyan-300 file:font-medium file:cursor-pointer hover:file:bg-cyan-500/30 transition"
            />
            {preview && (
              <div className="mt-3 rounded-xl overflow-hidden border border-white/10 bg-slate-700/50 p-2">
                <img src={preview} alt="Preview" className="w-full max-h-40 object-contain rounded-lg" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Stock</label>
              <input name="stock" type="number" required
                className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-white/10 text-white focus:outline-none focus:border-cyan-500" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Status</label>
              <select name="status"
                className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-white/10 text-white focus:outline-none focus:border-cyan-500">
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition disabled:opacity-50">
              {saving ? "Adding..." : "Add Car"}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium transition">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddCar;
