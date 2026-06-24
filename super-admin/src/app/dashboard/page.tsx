"use client";

import { useEffect, useState, useCallback, memo, useRef } from "react";
import axios from "axios";
import { Users, Store, IndianRupee, Activity, CheckCircle, ShieldAlert, Search, Filter, X } from "lucide-react";

interface DashboardMetrics {
  totalSalons: number;
  activeSalons: number;
  monthlyRevenue: number;
  apiCost: number;
  profitMargin: number;
  activeSubscriptions: number;
  totalBarbers: number;
}

interface Salon {
  id: string;
  name: string;
  ownerId: string;
  subscriptionId: string;
  status: "PENDING" | "ACTIVE" | "SUSPENDED";
}

// Memoized value component so React explicitly knows only this text node updates when data changes
const CardNumber = memo(function CardNumber({ value }: { value: string | number }) {
  return <div className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{value}</div>;
});

// Memoized FilterCard to prevent re-renders unless its specific props change
const FilterCard = memo(function FilterCard({ id, title, value, icon, isActive, onSelect }: any) {
  return (
    <div 
      onClick={() => onSelect(id)}
      className={`relative overflow-hidden bg-white p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between ${
        isActive 
          ? 'shadow-[0_4px_20px_rgb(0,0,0,0.12)] border border-[#1877f2]' 
          : 'shadow-[0_2px_8px_rgb(0,0,0,0.06)] border border-gray-100 hover:shadow-[0_4px_12px_rgb(0,0,0,0.08)]'
      }`}
    >
      {isActive && (
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-[#1877f2]/10 to-transparent rounded-bl-full -mr-2 -mt-2 transition-all duration-500"></div>
      )}
      <div className="flex items-center justify-between mb-2 sm:mb-3 relative z-10">
        <div className={`p-2 sm:p-2.5 rounded-lg transition-colors ${isActive ? 'bg-[#1877f2]/10 text-[#1877f2]' : 'bg-gray-50 text-gray-500'}`}>
          {icon}
        </div>
      </div>
      <div className="relative z-10">
        <h3 className="text-gray-500 text-[10px] sm:text-xs font-semibold tracking-wide uppercase line-clamp-1">{title}</h3>
        <CardNumber value={value} />
      </div>
    </div>
  );
});

// Mock generator for infinite scroll demo
const MOCK_DB = Array.from({ length: 142 }).map((_, i) => {
  const subs = ["Free", "Starter", "Premium", "Enterprise"];
  const statuses = ["ACTIVE", "PENDING", "SUSPENDED"];
  return {
    id: `${i + 1}`,
    name: `Salon ${i + 1} ${['Elite', 'Cuts', 'Glamour', 'Edge'][i % 4]}`,
    ownerId: `user_${1000 + i}`,
    subscriptionId: subs[i % 4],
    status: statuses[i % 3] as any
  };
});

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  
  // List state
  const [salons, setSalons] = useState<Salon[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Filters
  const [selectedFilter, setSelectedFilter] = useState<"ALL" | "ACTIVE" | "PENDING" | "SUSPENDED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [subFilter, setSubFilter] = useState("ALL");
  
  // Details Modal State
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  
  const observerTarget = useRef(null);

  // Initial Metrics Fetch
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
        const token = "mock-jwt-token"; 
        const res = await axios.get(`${apiUrl}/admin/dashboard/metrics`, { headers: { Authorization: `Bearer ${token}` } });
        setMetrics(res.data);
      } catch (err) {
        setMetrics({
          totalSalons: 142, activeSalons: 128, monthlyRevenue: 28500,
          apiCost: 4200, profitMargin: 85, activeSubscriptions: 110, totalBarbers: 450
        });
      }
    };
    fetchMetrics();
  }, []);

  // Fetch Salons (effect triggers on page, filters change)
  useEffect(() => {
    const fetchSalons = async () => {
      if (page === 1) setIsInitialLoad(true);
      else setIsLoadingMore(true);

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
        const token = "mock-jwt-token"; 
        
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "10",
          ...(selectedFilter !== "ALL" && { status: selectedFilter }),
          ...(subFilter !== "ALL" && { plan: subFilter }),
          ...(searchQuery && { search: searchQuery })
        });

        const res = await axios.get(`${apiUrl}/admin/salons?${params}`, { headers: { Authorization: `Bearer ${token}` } });
        
        if (page === 1) {
          setSalons(res.data.data || res.data);
        } else {
          setSalons(prev => [...prev, ...(res.data.data || res.data)]);
        }
        setHasMore(res.data.hasMore ?? false);

      } catch (err) {
        // Fallback to mock DB logic
        let filtered = MOCK_DB;
        if (selectedFilter !== "ALL") filtered = filtered.filter(s => s.status === selectedFilter);
        if (subFilter !== "ALL") filtered = filtered.filter(s => s.subscriptionId === subFilter);
        if (searchQuery) filtered = filtered.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

        const limit = 10;
        const start = (page - 1) * limit;
        const paginated = filtered.slice(start, start + limit);
        
        setTimeout(() => {
          if (page === 1) setSalons(paginated);
          else setSalons(prev => [...prev, ...paginated]);
          setHasMore(start + limit < filtered.length);
          setIsInitialLoad(false);
          setIsLoadingMore(false);
        }, 500); // simulate network delay
        return; // exit early
      }

      setIsInitialLoad(false);
      setIsLoadingMore(false);
    };

    // Debounce search
    const timer = setTimeout(() => fetchSalons(), 300);
    return () => clearTimeout(timer);
  }, [page, selectedFilter, searchQuery, subFilter]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
    setSalons([]);
  }, [selectedFilter, searchQuery, subFilter]);

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isInitialLoad) {
          setPage(p => p + 1);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, isInitialLoad]);

  const handleFilterSelect = useCallback((filterId: any) => {
    setSelectedFilter(filterId);
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <FilterCard 
          id="ALL" title="Total Salons" value={metrics?.totalSalons.toString() || "0"}
          icon={<Store className="w-5 h-5" />} isActive={selectedFilter === "ALL"} onSelect={handleFilterSelect}
        />
        <FilterCard 
          id="ACTIVE" title="Active Salons" value={metrics?.activeSalons.toString() || "0"}
          icon={<CheckCircle className="w-5 h-5" />} isActive={selectedFilter === "ACTIVE"} onSelect={handleFilterSelect}
        />
        <FilterCard 
          id="PENDING" title="Pending Approvals" value={MOCK_DB.filter(s=>s.status==="PENDING").length.toString()}
          icon={<Users className="w-5 h-5" />} isActive={selectedFilter === "PENDING"} onSelect={handleFilterSelect}
        />
        <FilterCard 
          id="SUSPENDED" title="Suspended" value={MOCK_DB.filter(s=>s.status==="SUSPENDED").length.toString()}
          icon={<ShieldAlert className="w-5 h-5" />} isActive={selectedFilter === "SUSPENDED"} onSelect={handleFilterSelect}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] flex flex-col sm:flex-row items-start sm:items-center border border-gray-100">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-2 sm:mb-0 sm:mr-4 shrink-0">
            <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] sm:text-sm font-semibold tracking-wide uppercase text-gray-500 line-clamp-1">Revenue</p>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5 sm:mt-0">₹{metrics?.monthlyRevenue.toLocaleString('en-IN') || "0"}</h3>
          </div>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] flex flex-col sm:flex-row items-start sm:items-center border border-gray-100">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-rose-50 flex items-center justify-center mb-2 sm:mb-0 sm:mr-4 shrink-0">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600" />
          </div>
          <div>
            <p className="text-[10px] sm:text-sm font-semibold tracking-wide uppercase text-gray-500 line-clamp-1">API Cost</p>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5 sm:mt-0">₹{metrics?.apiCost.toLocaleString('en-IN') || "0"}</h3>
          </div>
        </div>
      </div>

      {/* Customers List Section */}
      <div className="bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] overflow-hidden mt-6 flex flex-col h-[600px] border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center bg-white gap-4 z-10 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 flex-shrink-0">
            {selectedFilter === "ALL" ? "All Salons" : `${selectedFilter.charAt(0) + selectedFilter.slice(1).toLowerCase()} Salons`}
          </h2>
          
          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search salons..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#f0f2f5] border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#1877f2]"
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Filter className="w-4 h-4 text-gray-400" />
              </div>
              <select 
                value={selectedFilter}
                onChange={e => setSelectedFilter(e.target.value as any)}
                className="appearance-none pl-9 pr-8 py-2 bg-[#f0f2f5] border-none rounded-full text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1877f2] cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Filter className="w-4 h-4 text-gray-400" />
              </div>
              <select 
                value={subFilter}
                onChange={e => setSubFilter(e.target.value)}
                className="appearance-none pl-9 pr-8 py-2 bg-[#f0f2f5] border-none rounded-full text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1877f2] cursor-pointer"
              >
                <option value="ALL">All Plans</option>
                <option value="Free">Free</option>
                <option value="Starter">Starter</option>
                <option value="Premium">Premium</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 bg-white">
          {salons.map(salon => (
            <div 
              key={salon.id} 
              onClick={() => setSelectedSalon(salon)}
              className="p-4 hover:bg-gray-50 transition flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 items-center justify-center text-blue-700 font-bold shadow-inner mr-3 sm:mr-4 flex-shrink-0 hidden sm:flex">
                  {salon.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900">{salon.name}</h4>
                  <p className="text-xs text-gray-500 hidden sm:block mt-0.5">Owner: {salon.ownerId}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <span className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 text-[10px] sm:text-xs font-semibold rounded-full whitespace-nowrap">
                  {salon.subscriptionId}
                </span>
                <span className={`px-2 py-1 text-[10px] sm:text-xs font-semibold rounded-full whitespace-nowrap ${
                  salon.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                  salon.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {salon.status}
                </span>
              </div>
            </div>
          ))}
          
          {isInitialLoad && (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1877f2]"></div>
            </div>
          )}

          {!isInitialLoad && salons.length === 0 && (
            <div className="p-12 text-center text-gray-500 flex flex-col items-center">
              <Store className="w-12 h-12 text-gray-300 mb-3" />
              <p>No salons found matching your filters.</p>
            </div>
          )}

          {/* Infinite Scroll Target */}
          <div ref={observerTarget} className="h-4 w-full" />
          
          {isLoadingMore && (
            <div className="p-4 flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1877f2]"></div>
            </div>
          )}
          
          {!hasMore && salons.length > 0 && (
            <div className="p-6 text-center text-xs font-medium text-gray-400">
              End of list
            </div>
          )}
        </div>
      </div>

      {/* Slide-over Salon Details View */}
      {selectedSalon && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" 
            onClick={() => setSelectedSalon(null)}
          ></div>
          
          {/* Slide Panel */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-gray-200">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white shadow-sm z-10">
              <h2 className="text-xl font-bold text-gray-900">Salon Details</h2>
              <button 
                onClick={() => setSelectedSalon(null)} 
                className="p-2 hover:bg-gray-100 text-gray-500 hover:text-gray-900 rounded-full transition-colors"
              >
                <X className="w-5 h-5"/>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-8 bg-[#f9fafb]">
              {/* Header Info */}
              <div className="flex items-center space-x-5 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1877f2]/20 to-[#1877f2]/10 flex items-center justify-center text-[#1877f2] text-2xl font-bold shadow-inner">
                  {selectedSalon.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedSalon.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">Tenant ID: <span className="font-mono text-gray-700">{selectedSalon.id}</span></p>
                </div>
              </div>

              {/* Grid Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Status</p>
                  <p className={`font-bold mt-1.5 ${
                    selectedSalon.status === 'ACTIVE' ? 'text-emerald-600' :
                    selectedSalon.status === 'PENDING' ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {selectedSalon.status}
                  </p>
                </div>
                <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Plan</p>
                  <p className="font-bold text-gray-900 mt-1.5">{selectedSalon.subscriptionId}</p>
                </div>
                <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Owner ID</p>
                  <p className="font-bold text-gray-900 mt-1.5">{selectedSalon.ownerId}</p>
                </div>
                <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Joined</p>
                  <p className="font-bold text-gray-900 mt-1.5">24 Jun 2026</p>
                </div>
              </div>

              {/* Mock Contact Section */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                  Contact Information
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                    <span className="text-sm text-gray-500">Email</span>
                    <span className="text-sm font-medium text-gray-900">contact@{selectedSalon.name.toLowerCase().replace(/\s/g,'')}.com</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                    <span className="text-sm text-gray-500">Phone</span>
                    <span className="text-sm font-medium text-gray-900">+91 98765 43210</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Location</span>
                    <span className="text-sm font-medium text-gray-900">Mumbai, India</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button className="flex-1 bg-[#1877f2] hover:bg-[#166fe5] text-white py-3 rounded-xl font-bold transition shadow-sm hover:shadow-md hover:-translate-y-0.5">
                  Manage Salon
                </button>
                <button className="px-5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-bold transition shadow-sm">
                  Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
