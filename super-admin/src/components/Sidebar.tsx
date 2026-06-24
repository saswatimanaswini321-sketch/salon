"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Users, CreditCard, Settings2, BarChart3, Settings, Menu, X } from "lucide-react";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 grid grid-cols-3 items-center sticky top-0 z-30 shadow-sm">
        <div className="flex justify-start">
          <button onClick={() => setIsOpen(!isOpen)} className="p-2 bg-gray-50 rounded-md text-gray-600 hover:bg-gray-100 transition">
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        <div className="flex justify-center items-center">
          <span className="font-bold text-gray-900 tracking-tight text-lg whitespace-nowrap">AI Salon</span>
        </div>
        <div className="flex justify-end">
          {/* Empty to balance the grid and keep title perfectly centered */}
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col h-full shrink-0 shadow-sm transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:z-auto
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-4 items-center border-b border-gray-100 hidden md:flex">
          <div className="w-10 h-10 bg-[#1877f2] rounded-full flex items-center justify-center text-white font-bold text-xl mr-3 shadow-sm">
            AI
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">AI Salon</span>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <Link onClick={() => setIsOpen(false)} href="/dashboard" className="flex items-center px-3 py-2.5 rounded-lg hover:bg-gray-100 text-gray-700 font-medium transition group">
            <LayoutDashboard className="w-5 h-5 mr-3 text-gray-500 group-hover:text-[#1877f2] transition" /> Dashboard
          </Link>
          <Link onClick={() => setIsOpen(false)} href="/salons" className="flex items-center px-3 py-2.5 rounded-lg hover:bg-gray-100 text-gray-700 font-medium transition group">
            <Users className="w-5 h-5 mr-3 text-gray-500 group-hover:text-[#1877f2] transition" /> Salons & Tenants
          </Link>
          <Link onClick={() => setIsOpen(false)} href="/subscriptions" className="flex items-center px-3 py-2.5 rounded-lg hover:bg-gray-100 text-gray-700 font-medium transition group">
            <CreditCard className="w-5 h-5 mr-3 text-gray-500 group-hover:text-[#1877f2] transition" /> Subscriptions
          </Link>
          <Link onClick={() => setIsOpen(false)} href="/ai-settings" className="flex items-center px-3 py-2.5 rounded-lg hover:bg-gray-100 text-gray-700 font-medium transition group">
            <Settings2 className="w-5 h-5 mr-3 text-gray-500 group-hover:text-[#1877f2] transition" /> AI Engine Settings
          </Link>
          <Link onClick={() => setIsOpen(false)} href="/reports" className="flex items-center px-3 py-2.5 rounded-lg hover:bg-gray-100 text-gray-700 font-medium transition group">
            <BarChart3 className="w-5 h-5 mr-3 text-gray-500 group-hover:text-[#1877f2] transition" /> Reports & Analytics
          </Link>
          <Link onClick={() => setIsOpen(false)} href="/settings" className="flex items-center px-3 py-2.5 rounded-lg hover:bg-gray-100 text-gray-700 font-medium transition group">
            <Settings className="w-5 h-5 mr-3 text-gray-500 group-hover:text-[#1877f2] transition" /> Platform Settings
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-200 border border-gray-300"></div>
            <div className="ml-3">
              <p className="text-sm font-semibold text-gray-900">Super Admin</p>
              <p className="text-xs text-gray-500">System Owner</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
