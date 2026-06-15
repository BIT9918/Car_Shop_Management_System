import React, { useState } from "react";
import {
  FaFacebookF,
  FaTiktok,
  FaTelegramPlane,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaPaperPlane,
  FaCheckCircle,
} from "react-icons/fa";

const infoList = [
  {
    icon: <FaMapMarkerAlt />,
    title: "Address",
    text: "Phnom Penh, Cambodia",
  },
  {
    icon: <FaPhoneAlt />,
    title: "Phone",
    text: "088 423 792 3",
  },
  {
    icon: <FaEnvelope />,
    title: "Email",
    text: "mmengrithychey24@cam-ed.com",
  },
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.name.trim()) nextErrors.name = "Please enter your name";
    if (!formData.email.trim()) {
      nextErrors.email = "Please enter your email";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      nextErrors.email = "Email is not correct";
    }
    if (!formData.message.trim()) nextErrors.message = "Please enter your message";

    return nextErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({ name: "", email: "", message: "" });
      setTimeout(() => setIsSuccess(false), 4000);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Contact Us
          </h1>
          <p className="text-gray-500 mt-3 max-w-2xl">
            Have a question about a car? Send us a message and we will reply soon.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            {infoList.map((item) => (
              <div
                key={item.title}
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 break-words">{item.text}</p>
                </div>
              </div>
            ))}

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900">Follow Us</h3>
              <div className="flex gap-3 mt-4">
                <a
                  href="https://web.facebook.com/meng.rithybit/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition"
                >
                  <FaFacebookF />
                </a>
                <a
                  href="https://www.tiktok.com/@bit.coder8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition"
                >
                  <FaTiktok />
                </a>
                <a
                  href="https://t.me/Meng_Rithy_Chey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition"
                >
                  <FaTelegramPlane />
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm p-5 md:p-7">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Send Message</h2>
              <p className="text-sm text-gray-500 mt-2">
                Fill in the form below.
              </p>
            </div>

            {isSuccess && (
              <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
                <FaCheckCircle />
                Your message has been sent.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className={`w-full px-4 py-3 rounded-xl border outline-none text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                      errors.name ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Your email"
                    className={`w-full px-4 py-3 rounded-xl border outline-none text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                      errors.email ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="mt-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message here"
                  className={`w-full min-h-40 px-4 py-3 rounded-xl border outline-none text-sm resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                    errors.message ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"
                  }`}
                />
                {errors.message && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.message}</p>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <FaPaperPlane className="text-xs" />
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
