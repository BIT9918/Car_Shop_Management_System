import React, { useEffect, useState, useCallback } from "react";
import { FaFacebookF, FaTiktok, FaTelegramPlane, FaShippingFast, FaShieldAlt, FaLock, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate, NavLink } from "react-router-dom";
import { getProducts } from "../../services/ProductService";

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
  
  return "/videos/suv.mp4";
};

function Home() {
  const navigate = useNavigate();

  const [cars, setCars] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [activeTab, setActiveTab] = useState("video");

  const handleOpenModal = (car) => {
    setSelectedCar(car);
    setActiveTab("video");
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
          <div className="text-6xl mb-4">🚗</div>
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
                  src={`http://127.0.0.1:8000/storage/cars/${currentCar.image}`}
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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedCar(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 md:p-8 max-w-lg w-full relative shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedCar(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors text-lg"
            >
              ✕
            </button>

            <div className="flex flex-col justify-between min-h-[300px] mb-6">
              {/* Media area */}
              <div className="flex-grow flex items-center justify-center overflow-hidden bg-gray-50 rounded-xl min-h-[220px]">
                {activeTab === "video" ? (
                  <video
                    src={getCarVideoUrl(selectedCar.name, selectedCar.brand)}
                    className="w-full aspect-video rounded-xl shadow-lg border-0 min-h-[200px] object-cover bg-black"
                    autoPlay
                    loop
                    muted
                    controls
                    playsInline
                  />
                ) : (
                  <img
                    src={`http://127.0.0.1:8000/storage/cars/${selectedCar.image}`}
                    alt={selectedCar.name}
                    className="max-h-full object-contain"
                    onError={(e) => {
                      e.target.src = "https://placehold.co/400x256/f1f5f9/94a3b8?text=No+Image";
                    }}
                  />
                )}
              </div>

              {/* Tab selector */}
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setActiveTab("photo")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeTab === "photo"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  📷 Photo
                </button>
                <button
                  onClick={() => setActiveTab("video")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeTab === "video"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  🎥 Video Showcase
                </button>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900">{selectedCar.name}</h2>
            <p className="text-gray-500 mt-1">{selectedCar.brand}</p>
            <p className="text-blue-600 font-bold text-xl mt-3">
              ${Number(selectedCar.price || 0).toLocaleString()}
            </p>

            {selectedCar.description && (
              <p className="text-gray-600 mt-4 text-sm leading-relaxed max-h-28 overflow-y-auto">
                {selectedCar.description}
              </p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => navigate("/user/products")}
                className="flex-1 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium text-gray-700 transition-colors"
              >
                View All Cars
              </button>
              <button
                onClick={() => setSelectedCar(null)}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;