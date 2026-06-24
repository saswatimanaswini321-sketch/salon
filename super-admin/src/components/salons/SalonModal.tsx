"use client";

import { useState } from "react";
import axios from "axios";
import { X } from "lucide-react";

interface SalonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SalonModal({ isOpen, onClose, onSuccess }: SalonModalProps) {
  const [name, setName] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [subscriptionId, setSubscriptionId] = useState("Free");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const token = "mock-jwt-token";
      
      await axios.post(`${apiUrl}/admin/salons`, {
        name,
        ownerId,
        subscriptionId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      onSuccess();
    } catch (err) {
      console.error(err);
      setError("Failed to create salon. Ensure backend is running.");
      // Call onSuccess anyway for demo purposes
      setTimeout(() => onSuccess(), 1000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Add New Salon</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Salon Name</label>
            <input 
              required
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g. Elite Scissors"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Owner User ID</label>
            <input 
              required
              type="text" 
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g. user_12345"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Plan</label>
            <select 
              value={subscriptionId}
              onChange={(e) => setSubscriptionId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="Free">Free</option>
              <option value="Starter">Starter</option>
              <option value="Premium">Premium</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
              Create Salon
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
