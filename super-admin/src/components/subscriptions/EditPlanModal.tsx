"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price: number;
  barberLimit: number;
  aiLimit: number;
}

interface EditPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  plan: Plan;
}

export default function EditPlanModal({ isOpen, onClose, onSuccess, plan }: EditPlanModalProps) {
  const [price, setPrice] = useState(0);
  const [barberLimit, setBarberLimit] = useState(0);
  const [aiLimit, setAiLimit] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (plan) {
      setPrice(plan.price);
      setBarberLimit(plan.barberLimit);
      setAiLimit(plan.aiLimit);
    }
  }, [plan]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const token = "mock-jwt-token";
      
      await axios.put(`${apiUrl}/admin/subscriptions/${plan.id}`, {
        price,
        barberLimit,
        aiLimit
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      onSuccess();
    } catch (err) {
      console.error(err);
      setError("Failed to update plan. Ensure backend is running.");
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
          <h2 className="text-xl font-bold text-gray-900">Edit {plan.name} Plan</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Price ($)</label>
            <input 
              required
              type="number" 
              min="0"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Barber Limit</label>
            <input 
              required
              type="number" 
              min="1"
              value={barberLimit}
              onChange={(e) => setBarberLimit(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Use 9999 for unlimited"
            />
            <p className="text-xs text-gray-500 mt-1">Use 9999 for unlimited barbers</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">AI Request Limit</label>
            <input 
              required
              type="number" 
              min="0"
              value={aiLimit}
              onChange={(e) => setAiLimit(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Monthly API requests limit"
            />
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
