import React, { useEffect, useState } from "react";
import { getProducts } from "../../services/ProductService";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaTimes, FaFilter, FaShoppingCart, FaEye, FaImage, FaVideo, FaCheck } from "react-icons/fa";
import { IMG_BASE } from "../../config/api";

const getCarVideoUrl = (name = "", brand = "") => {
  const query = `${brand} ${name}`.toLowerCase();
  
  if (query.includes("mustang")) {
    return "/videos/mustang.mp4";
  }
  if (query.includes("hilux")) {
    return "/videos/hilux.mp4";
  }
  if (
    query.includes("x5") ||
    query.includes("sportage") ||
    query.includes("cx-5") ||
    query.includes("cx5")
  ) {
    return "/videos/suv.mp4";
  }
  
  return "/videos/showroom.mp4";
};

function CarProduct() {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [priceSort, setPriceSort] = useState("");
  const [addedId, setAddedId] = useState(null);
  const [cartNotice, setCartNotice] = useState(null);
  const [activeTab, setActiveTab] = useState("photo");
  const [zoomImage, setZoomImage] = useState(false);

  const navigate = useNavigate();

  const handleOpenModal = (car) => {
    setSelected(car);
    setActiveTab("photo");
    setZoomImage(false);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getProducts();
      setProducts(data);
    };
    fetchProducts();
  }, []);

  const handleAddToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existIndex = cart.findIndex((i) => i.id === product.id);

    if (existIndex !== -1) {
      const exist = cart[existIndex];
      const newQty = exist.quantity + 1;

      if (newQty > product.stock) {
        alert("Stock limit reached");
        return;
      }

      cart[existIndex].quantity = newQty;
    } else {
      if (product.stock < 1) {
        alert("Out of stock");
        return;
      }

      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    setAddedId(product.id);
    setCartNotice({
      name: product.name,
      totalItems,
    });
    setTimeout(() => setAddedId(null), 1200);
    setTimeout(() => setCartNotice(null), 2200);
  };

  const uniqueBrands = [
    ...new Set(products.map((item) => item.brand).filter(Boolean)),
  ];

  const filteredProducts = products
    .filter((item) => {
      if (item.status != 1) return false;
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesBrand = filterBrand === "" || item.brand === filterBrand;

      return matchesSearch && matchesBrand;
    })
    .sort((a, b) => {
      if (priceSort === "low-high") {
        return Number(a.price) - Number(b.price);
      }
      if (priceSort === "high-low") {
        return Number(b.price) - Number(a.price);
      }
      return 0;
    });

  const hasActiveFilters = searchTerm || filterBrand || priceSort;

  return (
    <div className="min-h-screen bg-gray-50">
      {cartNotice && (
        <div className="fixed right-4 top-20 z-50 w-[calc(100%-2rem)] max-w-sm animate-fade-in">
          <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <FaShoppingCart />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-gray-900">Added to cart</p>
                <p className="text-sm text-gray-500 truncate">{cartNotice.name}</p>
                <p className="text-xs text-blue-600 font-semibold mt-1">
                  Cart now has {cartNotice.totalItems} item{cartNotice.totalItems > 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={() => setCartNotice(null)}
                className="text-gray-400 hover:text-gray-700 transition"
                aria-label="Close notification"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="sticky top-16 z-30 bg-white/90 backdrop-blur-xl border-b border-gray-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center">

            <div className="relative flex-1 w-full">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search vehicles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 text-sm transition-all"
              />
            </div>

            <div className="relative">
              <FaFilter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <select
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 text-sm appearance-none cursor-pointer transition-all"
              >
                <option value="">All Brands</option>
                {uniqueBrands.map((brand, index) => (
                  <option key={index} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <select
                value={priceSort}
                onChange={(e) => setPriceSort(e.target.value)}
                className="px-4 pr-8 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 text-sm appearance-none cursor-pointer transition-all"
              >
                <option value="">Default Price</option>
                <option value="low-high">Lowest to Highest</option>
                <option value="high-low">Highest to Lowest</option>
              </select>
            </div>

            {/* Clear Button */}
            {hasActiveFilters && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterBrand("");
                  setPriceSort("");
                }}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                <FaTimes className="text-xs" />
                Clear
              </button>
            )}
          </div>

          {/* Results count */}
          <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
            <span>{filteredProducts.length} vehicle{filteredProducts.length !== 1 ? 's' : ''} found</span>
          </div>
        </div>
      </div>

      {/* ═══ PRODUCTS GRID ═══ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
              <FaSearch className="text-2xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No vehicles found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-6">
            {filteredProducts.map((item, index) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 card-hover flex flex-col animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s`, animationFillMode: "both" }}
              >
                {/* Image */}
                <div className="relative w-full h-[200px] overflow-hidden group">
                  <img
                    src={
                      item.image
                        ? `${IMG_BASE}${item.image}`
                        : "https://placehold.co/300x200/f3f4f6/9ca3af?text=No+Image"
                    }
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Quick view overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="opacity-0 group-hover:opacity-100 bg-white/90 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium shadow-lg transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 flex items-center gap-2"
                    >
                      <FaEye className="text-xs" />
                      Quick View
                    </button>
                  </div>

                  {/* Stock badge */}
                  {item.stock <= 3 && item.stock > 0 && (
                    <span className="absolute top-3 left-3 text-[10px] px-2 py-1 bg-orange-500 text-white rounded-md font-semibold shadow-sm">
                      Only {item.stock} left
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 flex-grow flex flex-col">
                  <div className="flex-grow">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                      {item.brand}
                    </p>
                    <h2 className="font-semibold text-gray-900 mt-1 line-clamp-1">
                      {item.name}
                    </h2>
                    <p className="text-blue-600 font-bold text-lg mt-2">
                      ${Number(item.price).toLocaleString()}
                    </p>
                  </div>

                  {/* Stock status */}
                  <div className="mt-3">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-medium ${
                        item.stock > 0
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.stock > 0 ? "bg-emerald-500" : "bg-red-500"
                        }`}
                      ></span>
                      {item.stock > 0
                        ? `In stock: ${item.stock}`
                        : "Out of stock"}
                    </span>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={
                        item.stock <= 0 ||
                        (
                          JSON.parse(localStorage.getItem("cart")) || []
                        ).find((i) => i.id === item.id)?.quantity >=
                          item.stock
                      }
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        item.stock > 0
                          ? addedId === item.id
                            ? "bg-emerald-500 text-white"
                            : "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {addedId === item.id ? (
                        <>
                          <FaCheck className="text-xs" /> Added
                        </>
                      ) : (
                        <>
                          <FaShoppingCart className="text-xs" /> Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══ DETAIL MODAL ═══ */}
      {selected && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white w-full max-w-4xl shadow-2xl animate-scale-in overflow-hidden rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid md:grid-cols-[1.05fr_0.95fr] max-h-[90vh] overflow-y-auto">
              {/* Media Section */}
              <div className="relative bg-slate-950 flex flex-col justify-between min-h-[380px] md:min-h-[460px] overflow-hidden group">
                {/* Background Ambient Blur Glow from Car Image */}
                {selected.image && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <img
                      src={`${IMG_BASE}${selected.image}`}
                      alt=""
                      className="w-full h-full object-cover filter blur-3xl opacity-35 scale-125"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/30" />
                  </div>
                )}

                {/* Top Badge Overlay */}
                <div className="relative z-20 flex items-center justify-between p-4 md:p-5">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold tracking-wider uppercase bg-white/15 text-white backdrop-blur-md border border-white/20 shadow-sm">
                    {selected.brand}
                  </span>
                  {selected.year && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/90 backdrop-blur-md border border-white/10">
                      {selected.year}
                    </span>
                  )}
                </div>

                {/* Main Media Display Area */}
                <div className="relative z-10 flex-grow flex items-center justify-center p-4 md:p-6 overflow-hidden">
                  {activeTab === "video" ? (
                    <video
                      src={getCarVideoUrl(selected.name, selected.brand)}
                      className="w-full aspect-video rounded-2xl shadow-2xl border border-white/10 min-h-[260px] object-cover bg-black"
                      autoPlay
                      loop
                      muted
                      controls
                      playsInline
                    />
                  ) : (
                    <div
                      className="relative w-full h-full flex items-center justify-center cursor-zoom-in group/photo"
                      onClick={() => setZoomImage(true)}
                      title="Click to expand high-res photo"
                    >
                      <img
                        src={
                          selected.image
                            ? `${IMG_BASE}${selected.image}`
                            : "https://placehold.co/640x420/f3f4f6/9ca3af?text=No+Image"
                        }
                        alt={selected.name}
                        className="w-full h-auto max-h-[340px] md:max-h-[390px] object-contain rounded-xl drop-shadow-[0_25px_35px_rgba(0,0,0,0.6)] transition-all duration-500 group-hover/photo:scale-105"
                        onError={(e) => {
                          e.target.src = "https://placehold.co/640x420/f3f4f6/9ca3af?text=No+Image";
                        }}
                      />
                      <div className="absolute bottom-3 right-3 opacity-0 group-hover/photo:opacity-100 transition-all duration-200 bg-black/75 hover:bg-black/90 text-white text-xs font-medium px-3 py-1.5 rounded-lg backdrop-blur-md flex items-center gap-1.5 border border-white/20 shadow-xl">
                        <FaEye className="text-xs" /> Click to Expand
                      </div>
                    </div>
                  )}
                </div>

                {/* Tab selector */}
                <div className="relative z-20 flex justify-center gap-2.5 p-4 bg-slate-950/70 backdrop-blur-md border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setActiveTab("photo")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      activeTab === "photo"
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/40 scale-105"
                        : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white border border-white/10"
                    }`}
                  >
                    <FaImage className="text-sm" /> Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("video")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      activeTab === "video"
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/40 scale-105"
                        : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white border border-white/10"
                    }`}
                  >
                    <FaVideo className="text-sm" /> Video Showcase
                  </button>
                </div>
              </div>

              <div className="relative p-6 md:p-8 bg-white">
              <button
                onClick={() => setSelected(null)}
                className="absolute right-4 top-4 w-9 h-9 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition flex items-center justify-center cursor-pointer"
                aria-label="Close details"
              >
                <FaTimes />
              </button>
              <div className="pr-10">
                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">
                  {selected.brand}
                </p>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-950 mt-2 leading-tight">
                  {selected.name}
                </h2>
                <p className="text-3xl font-extrabold text-blue-600 mt-4">
                  ${Number(selected.price).toLocaleString()}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-6">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Year</p>
                  <p className="font-bold text-gray-900 mt-1">{selected.year || "N/A"}</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Stock</p>
                  <p className="font-bold text-gray-900 mt-1">{selected.stock}</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Status</p>
                  <p className={`font-bold mt-1 ${selected.stock > 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {selected.stock > 0 ? "Available" : "Sold Out"}
                  </p>
                </div>
              </div>

              {selected.description && (
                <div className="mt-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-2">Description</h3>
                  <p className="text-sm text-gray-600 leading-6 max-h-36 overflow-y-auto pr-2">
                    {selected.description}
                  </p>
                </div>
              )}

              <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-900">Purchase note</p>
                <p className="text-sm text-blue-700 mt-1">
                  Quantity is limited by current stock. Final purchase will update stock after payment.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-7">
                <button
                  onClick={() => handleAddToCart(selected)}
                  disabled={
                    selected.stock <= 0 ||
                    (
                      JSON.parse(localStorage.getItem("cart")) || []
                    ).find((i) => i.id === selected.id)?.quantity >=
                      selected.stock
                  }
                  className={`flex-1 rounded-xl py-3.5 text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    selected.stock > 0
                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <FaShoppingCart className="text-xs" />
                  Add to Cart
                </button>
                <button
                  onClick={() => {
                    handleAddToCart(selected);
                    setSelected(null);
                    navigate("/user/cart");
                  }}
                  disabled={selected.stock <= 0}
                  className="flex-1 rounded-xl py-3.5 text-sm font-bold border border-gray-300 text-gray-800 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
              </div>
            </div>
              </div>
            </div>
        </div>
      )}

      {/* ═══ FULLSCREEN PHOTO LIGHTBOX MODAL ═══ */}
      {zoomImage && selected && selected.image && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-2xl flex items-center justify-center z-[70] p-4 md:p-6 cursor-zoom-out animate-fade-in"
          onClick={() => setZoomImage(false)}
        >
          {/* Luminous Ambient Glow reflecting the car photo */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img
              src={`${IMG_BASE}${selected.image}`}
              alt=""
              className="w-full h-full object-cover filter blur-3xl opacity-40 scale-125 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/40 to-slate-950/70" />
          </div>

          {/* Frosted Glass Floating Card */}
          <div
            className="relative z-10 w-full max-w-3xl max-h-[92vh] bg-gradient-to-b from-slate-900/85 to-slate-950/90 backdrop-blur-2xl border border-white/20 shadow-[0_30px_70px_rgba(0,0,0,0.8)] rounded-3xl p-5 md:p-6 flex flex-col items-center cursor-default animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Bar */}
            <div className="w-full flex items-center justify-between pb-3.5 mb-2 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-blue-600 text-white shadow-md">
                  {selected.brand}
                </span>
                <h3 className="font-extrabold text-white text-lg md:text-xl tracking-tight">
                  {selected.name}
                </h3>
                {selected.year && (
                  <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-white/80 border border-white/10">
                    {selected.year}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-extrabold text-xl tracking-tight">
                  ${Number(selected.price).toLocaleString()}
                </span>
                <button
                  onClick={() => setZoomImage(false)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition border border-white/20 cursor-pointer shadow-md"
                  aria-label="Close photo preview"
                >
                  <FaTimes className="text-sm" />
                </button>
              </div>
            </div>

            {/* Photo Viewport */}
            <div className="w-full flex-grow flex items-center justify-center py-4 px-2 overflow-hidden">
              <img
                src={`${IMG_BASE}${selected.image}`}
                alt={selected.name}
                className="w-full max-w-2xl h-auto max-h-[64vh] object-contain rounded-2xl drop-shadow-[0_25px_50px_rgba(0,0,0,0.7)] transition-transform duration-300 hover:scale-[1.01]"
              />
            </div>

            {/* Footer Bar */}
            <div className="w-full mt-2 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/70">
              <div className="flex items-center gap-4">
                <span>
                  Stock: <strong className="text-white">{selected.stock}</strong>
                </span>
                <span className={selected.stock > 0 ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>
                  {selected.stock > 0 ? "Available in Showroom" : "Sold Out"}
                </span>
              </div>
              <span className="text-white/50 text-[11px]">Click outside or ✕ to close</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CarProduct;
