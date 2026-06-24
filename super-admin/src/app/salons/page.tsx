"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Search, MoreVertical, Edit, Trash2, ShieldAlert, CheckCircle } from "lucide-react";
import SalonModal from "@/components/salons/SalonModal";

interface Salon {
  id: string;
  name: string;
  ownerId: string;
  subscriptionId: string;
  status: "PENDING" | "ACTIVE" | "SUSPENDED";
  branches: any[];
}

export default function SalonsPage() {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSalons = async () => {
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const token = "mock-jwt-token";
      const res = await axios.get(`${apiUrl}/admin/salons`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSalons(res.data);
    } catch (err) {
      console.error("Failed to fetch salons:", err);
      // Fallback mock data
      setSalons([
        { id: "1", name: "Elite Scissors", ownerId: "user_123", subscriptionId: "Premium", status: "ACTIVE", branches: [] },
        { id: "2", name: "Cuts & Fades", ownerId: "user_456", subscriptionId: "Starter", status: "PENDING", branches: [] },
        { id: "3", name: "The Glamour Room", ownerId: "user_789", subscriptionId: "Enterprise", status: "SUSPENDED", branches: [] },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSalons();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const token = "mock-jwt-token";
      await axios.patch(`${apiUrl}/admin/salons/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Optimistic update
      setSalons(salons.map(s => s.id === id ? { ...s, status: newStatus as any } : s));
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update status (Backend might not be running)");
      // Still do optimistic update for demo purposes
      setSalons(salons.map(s => s.id === id ? { ...s, status: newStatus as any } : s));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this salon?")) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const token = "mock-jwt-token";
      await axios.delete(`${apiUrl}/admin/salons/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSalons(salons.filter(s => s.id !== id));
    } catch (err) {
      console.error("Failed to delete salon", err);
      alert("Failed to delete salon (Backend might not be running)");
      setSalons(salons.filter(s => s.id !== id));
    }
  };

  const filteredSalons = salons.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Salons & Tenants</h1>
          <p className="text-gray-500 mt-1">Manage B2B clients, their subscriptions and platform access.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 font-medium transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Salon
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search salons..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="text-sm text-gray-500">
            Total: {salons.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                <th className="p-4 font-semibold">Salon Name</th>
                <th className="p-4 font-semibold">Owner ID</th>
                <th className="p-4 font-semibold">Plan</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  </td>
                </tr>
              ) : filteredSalons.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No salons found.</td>
                </tr>
              ) : (
                filteredSalons.map((salon) => (
                  <tr key={salon.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{salon.name}</td>
                    <td className="p-4 text-gray-500 text-sm">{salon.ownerId}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                        {salon.subscriptionId}
                      </span>
                    </td>
                    <td className="p-4">
                      {salon.status === 'ACTIVE' && <span className="inline-flex items-center px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full"><CheckCircle className="w-3 h-3 mr-1" /> Active</span>}
                      {salon.status === 'PENDING' && <span className="inline-flex items-center px-2 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full">Pending</span>}
                      {salon.status === 'SUSPENDED' && <span className="inline-flex items-center px-2 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full"><ShieldAlert className="w-3 h-3 mr-1" /> Suspended</span>}
                    </td>
                    <td className="p-4 text-right flex justify-end space-x-2">
                      {salon.status !== 'ACTIVE' && (
                        <button onClick={() => handleStatusChange(salon.id, 'ACTIVE')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md" title="Activate">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {salon.status === 'ACTIVE' && (
                        <button onClick={() => handleStatusChange(salon.id, 'SUSPENDED')} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-md" title="Suspend">
                          <ShieldAlert className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => handleDelete(salon.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SalonModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          setIsModalOpen(false);
          fetchSalons();
        }}
      />
    </div>
  );
}
