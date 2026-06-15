import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaShoppingBag,
  FaMinus,
  FaPlus,
  FaTrashAlt,
  FaArrowLeft,
  FaLock,
  FaTimes,
  FaLocationArrow,
} from "react-icons/fa";

import qr from "../../assets/img/qr.png";

function Cart() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [showQR, setShowQR] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const [customerForm, setCustomerForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    location: "",
    delivery_method: "pickup",
    note: "",
  });

  const [customerErrors, setCustomerErrors] = useState({});
  const checkoutTimerRef = useRef(null);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const savedCustomer =
      JSON.parse(localStorage.getItem("checkoutCustomer")) || {};

    setCartItems(cart);

    setCustomerForm((prev) => ({
      ...prev,
      name: savedCustomer.name || user.name || "",
      email: savedCustomer.email || user.email || "",
      phone: savedCustomer.phone || "",
      address: savedCustomer.address || "",
      location: savedCustomer.location || "",
      delivery_method: savedCustomer.delivery_method || "pickup",
      note: savedCustomer.note || "",
    }));
  }, []);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const shipping = 0;
  const total = subtotal + shipping;

  // Detect real user location
  const detectUserLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        alert("Your browser does not support location detection.");
        resolve("");
        return;
      }

      setIsDetectingLocation(true);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          const mapLink = `https://www.google.com/maps?q=${lat},${lng}`;

          setCustomerForm((prev) => ({
            ...prev,
            location: mapLink,
          }));

          setIsDetectingLocation(false);
          resolve(mapLink);
        },
        () => {
          setIsDetectingLocation(false);
          alert("Location permission denied. You can add map link manually.");
          resolve("");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  // After click Proceed to Checkout, detect location first
  const handleCheckout = async () => {
    await detectUserLocation();
    setShowCustomerForm(true);
  };

  const handleDetectAgain = async () => {
    await detectUserLocation();
  };

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;

    setCustomerForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (customerErrors[name]) {
      setCustomerErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateCustomer = () => {
    const nextErrors = {};

    if (!customerForm.name.trim()) {
      nextErrors.name = "Please enter your name";
    }

    if (!customerForm.phone.trim()) {
      nextErrors.phone = "Please enter your phone";
    }

    if (!customerForm.email.trim()) {
      nextErrors.email = "Please enter your email";
    } else if (!/\S+@\S+\.\S+/.test(customerForm.email)) {
      nextErrors.email = "Email is not correct";
    }

    if (!customerForm.address.trim()) {
      nextErrors.address = "Please enter your address";
    }

    return nextErrors;
  };

  const handleCustomerSubmit = (e) => {
    e.preventDefault();

    const nextErrors = validateCustomer();

    if (Object.keys(nextErrors).length > 0) {
      setCustomerErrors(nextErrors);
      return;
    }

    localStorage.setItem("checkoutCustomer", JSON.stringify(customerForm));

    setShowCustomerForm(false);
    setShowQR(true);

    checkoutTimerRef.current = setTimeout(() => {
      navigate("/user/checkout");
    }, 5000);
  };

  const handleCancelPayment = () => {
    if (checkoutTimerRef.current) {
      clearTimeout(checkoutTimerRef.current);
    }

    setShowQR(false);
  };

  useEffect(() => {
    return () => {
      if (checkoutTimerRef.current) {
        clearTimeout(checkoutTimerRef.current);
      }
    };
  }, []);

  const updateQuantity = (id, newQty) => {
    const item = cartItems.find((i) => i.id === id);

    if (!item) return;
    if (newQty < 1) return;

    if (newQty > item.stock) {
      alert("Stock limit reached");
      return;
    }

    const updated = cartItems.map((i) =>
      i.id === id ? { ...i, quantity: newQty } : i
    );

    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const removeItem = (id) => {
    const updated = cartItems.filter((item) => item.id !== id);

    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="text-center animate-fade-in-up">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaShoppingBag className="text-3xl text-gray-300" />
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Your Cart is Empty
          </h1>

          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            Looks like you haven't added any vehicles yet.
          </p>

          <button
            onClick={() => navigate("/user/products")}
            className="px-8 py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-all shadow-lg shadow-blue-600/25 hover:shadow-xl hover:-translate-y-0.5"
          >
            Browse Vehicles
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {showCustomerForm && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <form
            onSubmit={handleCustomerSubmit}
            className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl animate-scale-in overflow-hidden border border-blue-100"
          >
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Buyer Information
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Please fill this before payment.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCustomerForm(false)}
                className="w-9 h-9 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 flex items-center justify-center transition"
                aria-label="Close buyer form"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-5 max-h-[78vh] overflow-y-auto">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>

                  <input
                    name="name"
                    value={customerForm.name}
                    onChange={handleCustomerChange}
                    placeholder="Your name"
                    className={`w-full px-4 py-3 rounded-xl border outline-none text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                      customerErrors.name
                        ? "border-red-400 bg-red-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  />

                  {customerErrors.name && (
                    <p className="text-red-500 text-xs mt-1.5">
                      {customerErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>

                  <input
                    name="phone"
                    value={customerForm.phone}
                    onChange={handleCustomerChange}
                    placeholder="Phone number"
                    className={`w-full px-4 py-3 rounded-xl border outline-none text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                      customerErrors.phone
                        ? "border-red-400 bg-red-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  />

                  {customerErrors.phone && (
                    <p className="text-red-500 text-xs mt-1.5">
                      {customerErrors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>

                  <input
                    name="email"
                    type="email"
                    value={customerForm.email}
                    onChange={handleCustomerChange}
                    placeholder="Your email"
                    className={`w-full px-4 py-3 rounded-xl border outline-none text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                      customerErrors.email
                        ? "border-red-400 bg-red-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  />

                  {customerErrors.email && (
                    <p className="text-red-500 text-xs mt-1.5">
                      {customerErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Receive Car
                  </label>

                  <select
                    name="delivery_method"
                    value={customerForm.delivery_method}
                    onChange={handleCustomerChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="pickup">Pick up at shop</option>
                    <option value="delivery">Delivery to my address</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address / Location
                </label>

                <textarea
                  name="address"
                  value={customerForm.address}
                  onChange={handleCustomerChange}
                  placeholder="Your address or place near you"
                  className={`w-full min-h-24 px-4 py-3 rounded-xl border outline-none text-sm resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                    customerErrors.address
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                />

                {customerErrors.address && (
                  <p className="text-red-500 text-xs mt-1.5">
                    {customerErrors.address}
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Map Link
                  </label>

                  <div className="flex gap-2">
                    <input
                      name="location"
                      value={customerForm.location}
                      onChange={handleCustomerChange}
                      placeholder="Google Maps link"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />

                    <button
                      type="button"
                      onClick={handleDetectAgain}
                      disabled={isDetectingLocation}
                      className="px-4 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60 flex items-center gap-2"
                    >
                      <FaLocationArrow className="text-xs" />
                      {isDetectingLocation ? "Detecting..." : "Detect"}
                    </button>
                  </div>

                  {customerForm.location && (
                    <a
                      href={customerForm.location}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block text-xs text-blue-600 underline mt-2"
                    >
                      Open detected map
                    </a>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note
                  </label>

                  <input
                    name="note"
                    value={customerForm.note}
                    onChange={handleCustomerChange}
                    placeholder="Any note"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-blue-50 border border-blue-100 p-4 text-sm text-blue-700">
                We need this information to contact you and prepare your car.
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => setShowCustomerForm(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                >
                  Continue to QR
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {showQR && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-scale-in overflow-hidden border border-blue-100">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  ABA Payment
                </h2>
                <p className="text-sm text-gray-500 mt-1">Scan QR to pay</p>
              </div>

              <button
                onClick={handleCancelPayment}
                className="w-9 h-9 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 flex items-center justify-center transition"
                aria-label="Cancel payment"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-5">
              <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 text-center mb-5">
                <p className="text-sm text-blue-700 font-medium">
                  Total Amount
                </p>

                <p className="text-4xl font-bold text-blue-700 mt-1">
                  $
                  {total.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>

              <div className="mx-auto w-full max-w-[280px] rounded-2xl bg-white border border-gray-200 p-4 shadow-sm">
                <img
                  src={qr}
                  alt="ABA Payment QR Code"
                  className="w-full h-auto object-contain"
                />
              </div>

              <div className="mt-5 text-center">
                <p className="text-sm font-semibold text-gray-800">
                  Open ABA Mobile and scan this QR.
                </p>

                <p className="text-xs text-gray-500 mt-2">
                  After payment, you will go to the success page.
                </p>
              </div>

              <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4 text-left">
                <p className="text-sm font-bold text-gray-900">Buyer Info</p>

                <div className="mt-3 space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-semibold text-gray-800">Name:</span>{" "}
                    {customerForm.name}
                  </p>

                  <p>
                    <span className="font-semibold text-gray-800">Phone:</span>{" "}
                    {customerForm.phone}
                  </p>

                  <p>
                    <span className="font-semibold text-gray-800">
                      Receive:
                    </span>{" "}
                    {customerForm.delivery_method === "delivery"
                      ? "Delivery"
                      : "Pick up at shop"}
                  </p>

                  <p className="line-clamp-2">
                    <span className="font-semibold text-gray-800">
                      Address:
                    </span>{" "}
                    {customerForm.address}
                  </p>

                  {customerForm.location && (
                    <p className="line-clamp-2">
                      <span className="font-semibold text-gray-800">Map:</span>{" "}
                      <a
                        href={customerForm.location}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline"
                      >
                        Open Map
                      </a>
                    </p>
                  )}

                  {customerForm.note && (
                    <p className="line-clamp-2">
                      <span className="font-semibold text-gray-800">Note:</span>{" "}
                      {customerForm.note}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5 h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full animate-[pulse_1.2s_ease-in-out_infinite]" />
              </div>

              <button
                onClick={handleCancelPayment}
                className="mt-5 w-full py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition"
              >
                Cancel Payment
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8 animate-fade-in">
          <button
            onClick={() => navigate("/user/products")}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FaArrowLeft className="text-gray-500" />
          </button>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Shopping Cart
            </h1>

            <p className="text-sm text-gray-500 mt-0.5">
              {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in
              your cart
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {cartItems.map((item, index) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors animate-fade-in"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    animationFillMode: "both",
                  }}
                >
                  <div className="w-24 h-24 md:w-28 md:h-28 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-100">
                    <img
                      src={
                        item.image
                          ? `http://127.0.0.1:8000/storage/cars/${item.image}`
                          : "https://placehold.co/112x112/f3f4f6/9ca3af?text=No+Image"
                      }
                      alt={item.name}
                      className="max-h-full object-contain p-1"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <h3 className="font-semibold text-gray-900 truncate">
                        {item.name}
                      </h3>

                      <p className="text-blue-600 font-bold mt-1">
                        ${Number(item.price).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="p-2 hover:bg-gray-100 transition-colors"
                        >
                          <FaMinus className="text-xs text-gray-500" />
                        </button>

                        <span className="px-4 py-1 text-sm font-semibold text-gray-800 min-w-[40px] text-center">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="p-2 hover:bg-gray-100 transition-colors"
                        >
                          <FaPlus className="text-xs text-gray-500" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="flex items-center gap-1.5 text-red-500 text-sm hover:text-red-700 transition-colors"
                      >
                        <FaTrashAlt className="text-xs" />
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900">
                      ${(item.price * item.quantity).toLocaleString()}
                    </p>

                    {item.quantity > 1 && (
                      <p className="text-xs text-gray-400 mt-1">
                        ${Number(item.price).toLocaleString()} each
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24 animate-slide-in-right">
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>
                    Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)}{" "}
                    items)
                  </span>
                  <span className="font-medium">
                    ${subtotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-medium">Free</span>
                </div>

                <div className="border-t border-gray-100 pt-4 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>${total.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isDetectingLocation}
                className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 hover:shadow-xl mb-3 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <FaLock className="text-xs" />
                {isDetectingLocation
                  ? "Detecting Location..."
                  : "Proceed to Checkout"}
              </button>

              <button
                onClick={() => navigate("/user/products")}
                className="w-full py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </button>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1.5">
                  <FaLock className="text-[10px]" />
                  Secure checkout • SSL encrypted
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Cart;