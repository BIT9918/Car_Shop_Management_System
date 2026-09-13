import React, { useEffect, useState, useCallback } from "react";
import { FaFacebookF, FaTiktok, FaTelegramPlane, FaShippingFast, FaShieldAlt, FaLock, FaChevronLeft, FaChevronRight, FaTimes, FaEye, FaShoppingCart, FaCar, FaImage, FaVideo } from "react-icons/fa";
import { useNavigate, NavLink } from "react-router-dom";
import { getProducts } from "../../services/ProductService";
import { IMG_BASE } from "../../config/api";

const getCarVideoUrl = (name = "", brand = "") => {
  const query = `${brand} ${name}`.toLowerCase();

  // here is just fake video i cant find any video in web this is just test
  
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
  
  return "/videos/suv.mp4";
};

function Home() {
  const navigate = useNavigate();

  const [cars, setCars] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [activeTab, setActiveTab] = useState("photo");
  const [zoomImage, setZoomImage] = useState(false);

  const handleOpenModal = (car) => {
    setSelectedCar(car);
    setActiveTab("photo");
    setZoomImage(false);
  };

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
    alert("Added to cart!");
  };

  // Load all available cars
  useEffect(() => {
    let isMounted = true;

    const fetchCars = async () => {
      try {
        setIsLoading(true);
        const data = await getProducts();

        if (isMounted) {
          const available = data
            .filter((p) => p.stock > 0 && p.status === true)
            .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

          setCars(available);
        }
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchCars();

    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-rotate carousel
  useEffect(() => {
    if (cars.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % cars.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [cars.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + cars.length) % cars.length);
  }, [cars.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % cars.length);
  }, [cars.length]);

  // ────────────────────────────────────────────────
  // Loading State
  // ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-gray-500 text-sm font-medium">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  if (cars.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center animate-fade-in-up">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm">
            <FaCar className="text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Coming Soon!</h2>
          <p className="text-gray-500">Check back soon for the latest vehicles.</p>
        </div>
      </div>
    );
  }

  const currentCar = cars[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ═══ HERO CAROUSEL ═══ */}
      <section className="relative flex-grow overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">

            {/* Left - Text Content */}
            <div className="space-y-6 order-2 md:order-1 text-center md:text-left animate-fade-in-up">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-full shadow-md">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                Featured Vehicle
              </span>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                {currentCar.name}
              </h1>

              <p className="text-lg md:text-xl text-gray-600 font-medium">
                {currentCar.brand}
              </p>

              {currentCar.price && (
                <p className="text-3xl font-bold text-blue-600">
                  ${Number(currentCar.price).toLocaleString()}
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-2">
                <button
                  onClick={() => handleOpenModal(currentCar)}
                  className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5"
                >
                  View Details
                </button>

                <button
                  onClick={() => navigate("/user/products")}
                  className="px-8 py-3.5 border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-600 font-semibold rounded-xl transition-all duration-300 hover:bg-blue-50"
                >
                  Browse All Cars
                </button>
              </div>
            </div>

            {/* Right - Car Image */}
            <div className="relative order-1 md:order-2 flex justify-center md:justify-end animate-fade-in">
              <div className="relative w-full max-w-[320px] md:max-w-[400px] lg:max-w-[480px] h-[240px] md:h-[340px] lg:h-[380px] rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-white">
                <img
                  src={`${IMG_BASE}${currentCar.image}`}
                  alt={currentCar.name}
                  className="w-full h-full object-cover transition-all duration-700 hover:scale-105"
                  onError={(e) => {
                    e.target.src = "https://placehold.co/480x340/f1f5f9/94a3b8?text=No+Image";
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Controls */}
        {cars.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-200 z-10 hover:scale-110"
              aria-label="Previous slide"
            >
              <FaChevronLeft className="text-gray-700" />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-200 z-10 hover:scale-110"
              aria-label="Next slide"
            >
              <FaChevronRight className="text-gray-700" />
            </button>

            {/* Dots indicator */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {cars.slice(0, 8).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`transition-all duration-300 rounded-full ${
                    idx === currentIndex
                      ? "w-8 h-2.5 bg-blue-600"
                      : "w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* ═══ FEATURES BAR ═══ */}
      <section className="py-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center gap-3 animate-fade-in-up delay-100">
              <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center">
                <FaShippingFast className="text-2xl" />
              </div>
              <div>
                <p className="font-semibold text-lg">Free Delivery</p>
                <p className="text-blue-200 text-sm">On orders over $500</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 animate-fade-in-up delay-200">
              <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center">
                <FaShieldAlt className="text-2xl" />
              </div>
              <div>
                <p className="font-semibold text-lg">1-Year Warranty</p>
                <p className="text-blue-200 text-sm">Official products</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 animate-fade-in-up delay-300">
              <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center">
                <FaLock className="text-2xl" />
              </div>
              <div>
                <p className="font-semibold text-lg">Secure Payment</p>
                <p className="text-blue-200 text-sm">100% protected</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-gray-900 text-gray-400 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">

            {/* Brand & Social */}
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-2xl font-bold text-white mb-3">CarShop</h3>
              <p className="text-gray-500 mb-6 text-sm leading-relaxed">
                Premium vehicles at the best prices. Fast delivery across Cambodia.
              </p>
              <div className="flex gap-3">
                <a href="https://web.facebook.com/meng.rithybit/" target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all duration-300">
                  <FaFacebookF />
                </a>
                <a href="https://www.tiktok.com/@bit.coder8" target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-gray-700 hover:text-white transition-all duration-300">
                  <FaTiktok />
                </a>
                <a href="https://t.me/Meng_Rithy_Chey" target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-blue-500 hover:text-white transition-all duration-300">
                  <FaTelegramPlane />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Quick Links</h4>
              <div className="flex flex-col gap-2.5 text-sm">
                <NavLink to="/user" className="hover:text-white transition-colors">Home</NavLink>
                <NavLink to="/user/products" className="hover:text-white transition-colors">Products</NavLink>
                <NavLink to="/user/contact" className="hover:text-white transition-colors">Contact</NavLink>
              </div>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Support</h4>
              <div className="flex flex-col gap-2.5 text-sm">
                <NavLink to="/user/contact" className="hover:text-white transition-colors">Help Center</NavLink>
                <a href="#" className="hover:text-white transition-colors">FAQ</a>
                <NavLink to="/user" className="hover:text-white transition-colors">Back to Home</NavLink>
              </div>
            </div>

            {/* Newsletter */}
            <div className="col-span-2 md:col-span-1">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Newsletter</h4>
              <p className="text-gray-500 mb-4 text-sm">Get the latest deals first.</p>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-sm text-white transition-colors">
                  Join
                </button>
              </form>
            </div>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-center items-center text-xs text-gray-500">
            <p className="mt-2 sm:mt-0">This Web just build for test right now</p>
          </div>
        </div>
      </footer>

      {/* ═══ CAR DETAIL MODAL ═══ */}
      {selectedCar && (
        <div
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedCar(null)}
        >
          <div
            className="bg-white w-full max-w-4xl shadow-2xl animate-scale-in overflow-hidden rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid md:grid-cols-[1.05fr_0.95fr] max-h-[90vh] overflow-y-auto">
              {/* Media Section */}
              <div className="relative bg-slate-950 flex flex-col justify-between min-h-[380px] md:min-h-[460px] overflow-hidden group">
                {/* Background Ambient Blur Glow from Car Image */}
                {selectedCar.image && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <img
                      src={`${IMG_BASE}${selectedCar.image}`}
                      alt=""
                      className="w-full h-full object-cover filter blur-3xl opacity-35 scale-125"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/30" />
                  </div>
                )}

                {/* Top Badge Overlay */}
                <div className="relative z-20 flex items-center justify-between p-4 md:p-5">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold tracking-wider uppercase bg-white/15 text-white backdrop-blur-md border border-white/20 shadow-sm">
                    {selectedCar.brand}
                  </span>
                  {selectedCar.year && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/90 backdrop-blur-md border border-white/10">
                      {selectedCar.year}
                    </span>
                  )}
                </div>

                {/* Main Media Display Area */}
                <div className="relative z-10 flex-grow flex items-center justify-center p-4 md:p-6 overflow-hidden">
                  {activeTab === "video" ? (
                    <video
                      src={getCarVideoUrl(selectedCar.name, selectedCar.brand)}
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
                          selectedCar.image
                            ? `${IMG_BASE}${selectedCar.image}`
                            : "https://placehold.co/640x420/f3f4f6/9ca3af?text=No+Image"
                        }
                        alt={selectedCar.name}
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

              {/* Details Section */}
              <div className="relative p-6 md:p-8 bg-white flex flex-col justify-between">
                <button
                  onClick={() => setSelectedCar(null)}
                  className="absolute right-4 top-4 w-9 h-9 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition flex items-center justify-center cursor-pointer"
                  aria-label="Close details"
                >
                  <FaTimes />
                </button>

                <div>
                  <div className="pr-10">
                    <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">
                      {selectedCar.brand}
                    </p>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-950 mt-1 leading-tight">
                      {selectedCar.name}
                    </h2>
                    <p className="text-3xl font-extrabold text-blue-600 mt-3">
                      ${Number(selectedCar.price || 0).toLocaleString()}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-6">
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">Year</p>
                      <p className="font-bold text-gray-900 mt-1">{selectedCar.year || "N/A"}</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">Stock</p>
                      <p className="font-bold text-gray-900 mt-1">{selectedCar.stock}</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">Status</p>
                      <p className={`font-bold mt-1 ${selectedCar.stock > 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {selectedCar.stock > 0 ? "Available" : "Sold Out"}
                      </p>
                    </div>
                  </div>

                  {selectedCar.description && (
                    <div className="mt-5">
                      <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-1.5">Description</h3>
                      <p className="text-sm text-gray-600 leading-6 max-h-28 overflow-y-auto pr-2">
                        {selectedCar.description}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => handleAddToCart(selectedCar)}
                      disabled={selectedCar.stock <= 0}
                      className={`flex-1 rounded-xl py-3 text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                        selectedCar.stock > 0
                          ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 cursor-pointer"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <FaShoppingCart className="text-xs" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCar(null);
                        navigate("/user/products");
                      }}
                      className="flex-1 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium text-gray-700 transition-colors text-sm cursor-pointer"
                    >
                      View All Cars
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ FULLSCREEN PHOTO LIGHTBOX MODAL ═══ */}
      {zoomImage && selectedCar && selectedCar.image && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-2xl flex items-center justify-center z-[70] p-4 md:p-6 cursor-zoom-out animate-fade-in"
          onClick={() => setZoomImage(false)}
        >
          {/* Luminous Ambient Glow reflecting the car photo */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img
              src={`${IMG_BASE}${selectedCar.image}`}
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
                  {selectedCar.brand}
                </span>
                <h3 className="font-extrabold text-white text-lg md:text-xl tracking-tight">
                  {selectedCar.name}
                </h3>
                {selectedCar.year && (
                  <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-white/80 border border-white/10">
                    {selectedCar.year}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-extrabold text-xl tracking-tight">
                  ${Number(selectedCar.price || 0).toLocaleString()}
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
                src={`${IMG_BASE}${selectedCar.image}`}
                alt={selectedCar.name}
                className="w-full max-w-2xl h-auto max-h-[64vh] object-contain rounded-2xl drop-shadow-[0_25px_50px_rgba(0,0,0,0.7)] transition-transform duration-300 hover:scale-[1.01]"
              />
            </div>

            {/* Footer Bar */}
            <div className="w-full mt-2 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/70">
              <div className="flex items-center gap-4">
                <span>
                  Stock: <strong className="text-white">{selectedCar.stock}</strong>
                </span>
                <span className={selectedCar.stock > 0 ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>
                  {selectedCar.stock > 0 ? "Available in Showroom" : "Sold Out"}
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

export default Home;