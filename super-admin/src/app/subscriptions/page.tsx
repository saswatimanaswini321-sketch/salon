"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { CreditCard, Check, Settings2, ShieldCheck, Zap } from "lucide-react";
import EditPlanModal from "@/components/subscriptions/EditPlanModal";

interface Subscription {
  id: string;
  name: string;
  price: number;
  barberLimit: number;
  aiLimit: number;
}

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Subscription | null>(null);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const token = "mock-jwt-token";
      const res = await axios.get(`${apiUrl}/admin/subscriptions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlans(res.data);
    } catch (err) {
      console.error("Failed to fetch subscriptions:", err);
      // Fallback mock data
      setPlans([
        { id: "1", name: "Free", price: 0, barberLimit: 1, aiLimit: 100 },
        { id: "2", name: "Starter", price: 29, barberLimit: 3, aiLimit: 1000 },
        { id: "3", name: "Premium", price: 99, barberLimit: 10, aiLimit: 5000 },
        { id: "4", name: "Enterprise", price: 299, barberLimit: 9999, aiLimit: 50000 },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSeed = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const token = "mock-jwt-token";
      await axios.post(`${apiUrl}/admin/subscriptions/seed`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPlans();
    } catch (err) {
      console.error("Failed to seed plans", err);
      alert("Failed to seed plans (Backend might not be running)");
    }
  };

  const getPlanIcon = (name: string) => {
    switch(name.toLowerCase()) {
      case 'free': return <Check className="w-6 h-6 text-gray-500" />;
      case 'starter': return <Zap className="w-6 h-6 text-yellow-500" />;
      case 'premium': return <CreditCard className="w-6 h-6 text-indigo-500" />;
      case 'enterprise': return <ShieldCheck className="w-6 h-6 text-emerald-500" />;
      default: return <CreditCard className="w-6 h-6 text-indigo-500" />;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Subscription Plans</h1>
          <p className="text-gray-500 mt-1">Manage pricing tiers, barber limits, and AI tokens for your tenants.</p>
        </div>
        <div className="flex space-x-3">
          {plans.length === 0 && !isLoading && (
            <button 
              onClick={handleSeed}
              className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-md shadow-sm hover:bg-indigo-100 font-medium transition"
            >
              Seed Default Plans
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    {getPlanIcon(plan.name)}
                  </div>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full uppercase tracking-wider">
                    {plan.name}
                  </span>
                </div>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-500 font-medium">/mo</span>
                </div>

                <ul className="space-y-3 mb-6 flex-1">
                  <li className="flex items-center text-gray-600 text-sm">
                    <Check className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />
                    {plan.barberLimit === 9999 ? 'Unlimited' : plan.barberLimit} Barbers allowed
                  </li>
                  <li className="flex items-center text-gray-600 text-sm">
                    <Check className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />
                    {plan.aiLimit === 50000 ? 'Unlimited' : plan.aiLimit.toLocaleString()} AI requests / mo
                  </li>
                  <li className="flex items-center text-gray-600 text-sm">
                    <Check className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />
                    Full Analytics Access
                  </li>
                  <li className="flex items-center text-gray-600 text-sm">
                    <Check className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />
                    Priority Support
                  </li>
                </ul>
              </div>
              
              <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <button 
                  onClick={() => {
                    setSelectedPlan(plan);
                    setIsModalOpen(true);
                  }}
                  className="w-full py-2.5 flex justify-center items-center text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <Settings2 className="w-4 h-4 mr-2" />
                  Edit Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPlan && (
        <EditPlanModal 
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedPlan(null);
          }}
          onSuccess={() => {
            setIsModalOpen(false);
            setSelectedPlan(null);
            fetchPlans();
          }}
          plan={selectedPlan}
        />
      )}
    </div>
  );
}
