"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/lib/api";

interface Salon {
  id: string;
  name: string;
  email?: string;
  status: string;
}

export default function NotificationsTab() {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [notifType, setNotifType] = useState<"OFFER" | "RENEWAL" | "SYSTEM">("OFFER");
  const [selectedSalon, setSelectedSalon] = useState("ALL");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [discount, setDiscount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchWithAuth("/admin/salons")
      .then((data: any) => {
        setSalons(data || []);
      })
      .catch(() => {});
  }, []);

  // Sync selected salon when notification type changes
  useEffect(() => {
    if (notifType === "RENEWAL" && selectedSalon === "ALL") {
      if (salons.length > 0) {
        setSelectedSalon(salons[0].id);
      } else {
        setSelectedSalon("");
      }
    }
  }, [notifType, salons, selectedSalon]);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      setError("Please fill in both the title and message.");
      return;
    }
    if (notifType === "RENEWAL" && (!selectedSalon || selectedSalon === "ALL")) {
      setError("Please select a specific salon owner for membership renewal.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    // Format message to automatically append the subscription discount if specified (for offers)
    const finalMessage = 
      notifType === "OFFER" && discount.trim()
        ? `${message}\n\n🏷️ Festival Offer: Get ${discount}% off your subscription renewal fee!`
        : message;

    try {
      await fetchWithAuth("/admin/notifications/broadcast", {
        method: "POST",
        body: JSON.stringify({ 
          salonId: selectedSalon, 
          type: notifType, 
          title, 
          message: finalMessage
        }),
      });
      setSuccess(true);
      setTitle("");
      setMessage("");
      setDiscount("");
      if (notifType === "OFFER" || notifType === "SYSTEM") {
        setSelectedSalon("ALL");
      } else if (salons.length > 0) {
        setSelectedSalon(salons[0].id);
      }
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to send notification.");
    } finally {
      setLoading(false);
    }
  };

  const getTargetSalonName = () => {
    if (selectedSalon === "ALL") return "All Salon Owners";
    const found = salons.find(s => s.id === selectedSalon);
    return found ? found.name : "Selected Salon";
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* Header Info */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">System Notification Center</h2>
        <p className="text-sm text-gray-500 mt-1">
          Broadcast alerts, promotional offers, or direct notices to your platform's Salon Owners.
        </p>
      </div>

      {/* Main Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Compose Form (Span 7 on desktop) */}
        <div className="lg:col-span-7 space-y-6 bg-white p-6 border border-gray-200 rounded-2xl shadow-sm">
          <h3 className="text-base font-semibold text-gray-900">Compose Notification</h3>
          
          <div className="space-y-4">
            {/* Notification Type */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Notification Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition ${
                  notifType === "OFFER" ? "border-blue-500 bg-blue-50/50 text-blue-700" : "border-gray-200 hover:bg-gray-50 text-gray-700"
                }`}>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="notifType"
                      value="OFFER"
                      checked={notifType === "OFFER"}
                      onChange={() => {
                        setNotifType("OFFER");
                        setSelectedSalon("ALL");
                      }}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2.5 text-sm font-medium">Festival Offer</span>
                  </div>
                </label>

                <label className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition ${
                  notifType === "RENEWAL" ? "border-blue-500 bg-blue-50/50 text-blue-700" : "border-gray-200 hover:bg-gray-50 text-gray-700"
                }`}>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="notifType"
                      value="RENEWAL"
                      checked={notifType === "RENEWAL"}
                      onChange={() => {
                        setNotifType("RENEWAL");
                        if (salons.length > 0) {
                          setSelectedSalon(salons[0].id);
                        } else {
                          setSelectedSalon("");
                        }
                      }}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2.5 text-sm font-medium">Renewal Notice</span>
                  </div>
                </label>

                <label className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition ${
                  notifType === "SYSTEM" ? "border-blue-500 bg-blue-50/50 text-blue-700" : "border-gray-200 hover:bg-gray-50 text-gray-700"
                }`}>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="notifType"
                      value="SYSTEM"
                      checked={notifType === "SYSTEM"}
                      onChange={() => {
                        setNotifType("SYSTEM");
                        setSelectedSalon("ALL");
                      }}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2.5 text-sm font-medium">Important Update</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Target Salon Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Send To
              </label>
              <select
                value={selectedSalon}
                onChange={(e) => setSelectedSalon(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {notifType !== "RENEWAL" && (
                  <option value="ALL">All Salon Owners</option>
                )}
                {salons.map((salon) => (
                  <option key={salon.id} value={salon.id}>
                    {salon.name} {salon.email ? `(${salon.email})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Subscription Discount (Only for Festival Offers) */}
            {notifType === "OFFER" && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Subscription Discount (%) (Optional)
                </label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="e.g. 20"
                  min="0"
                  max="100"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Notification Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  notifType === "OFFER" 
                    ? "e.g. Diwali Platform Special! 🪔" 
                    : notifType === "RENEWAL"
                    ? "e.g. Action Required: Subscription Renewal Looming ⚠️"
                    : "e.g. Scheduled System Maintenance Notice ⚙️"
                }
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  notifType === "OFFER" 
                    ? "Write a message to the salon owner. (e.g. To celebrate the festive season, we are offering an exclusive discount on your platform subscription renewal. Thank you for partnering with us!)" 
                    : notifType === "RENEWAL"
                    ? "Write a renewal message to the salon owner. (e.g. Your premium subscription will expire in 3 days. Please complete your renewal payment to keep access to all AI hair styling tools and barber management slots.)"
                    : "Write system notification details here. (e.g. The AI Salon Platform will undergo scheduled database maintenance on Sunday at 2:00 AM UTC. Expect brief service interruptions.)"
                }
                rows={5}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Error & Success Messages */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Notification dispatched successfully!
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSend}
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Send Notification
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Live Notification Preview Mockup (Span 5 on desktop) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Live Preview</h3>
            <p className="text-xs text-gray-500 mb-6">
              This is how your message will render in the Salon Owner's dashboard widget.
            </p>

            {/* Mock phone/widget container using Salon Owner's dark gold aesthetic */}
            <div className="w-full bg-[#050505] border border-gray-800 rounded-2xl overflow-hidden shadow-lg p-5">
              {/* Header inside mockup */}
              <div className="flex justify-between items-center border-b border-gray-900 pb-3 mb-4">
                <span className="text-xs text-gray-400 font-medium">Notification Center Preview</span>
                <span className="text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded font-bold">LIVE</span>
              </div>

              {/* Mock Notification Item */}
              <div className="bg-[#111111] border border-gray-800 rounded-xl p-4 relative space-y-3">
                {/* Meta Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      notifType === "SYSTEM" ? "bg-red-500 animate-pulse" : "bg-[#c59d5f]"
                    }`} />
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
                      {notifType === "OFFER" ? "FESTIVAL OFFER" : notifType === "RENEWAL" ? "RENEWAL ALERT" : "SYSTEM UPDATE"}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500">Just Now</span>
                </div>

                {/* Content Block */}
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white tracking-wide font-serif">
                    {title || "Untitled Notification"}
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-wrap">
                    {message || "Enter your message on the left to preview it..."}
                  </p>

                  {/* Appended discount preview if discount is entered */}
                  {notifType === "OFFER" && discount.trim() && (
                    <div className="mt-3 p-2 bg-[#c59d5f]/10 border border-[#c59d5f]/20 rounded-lg">
                      <p className="text-xs text-[#e8c68c] font-medium flex items-center gap-1.5">
                        <span>🏷️</span> Festival Offer: Get <span className="font-bold text-white">{discount}% off</span> your subscription renewal fee!
                      </p>
                    </div>
                  )}
                </div>

                {/* Target Audience Footer */}
                <div className="border-t border-gray-900/60 pt-2.5 flex justify-between items-center text-[10px] text-gray-500">
                  <span>To: <span className="text-[#c59d5f] font-semibold">{getTargetSalonName()}</span></span>
                  <span className="text-gray-600">ID: MOCK-XXXX</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
