"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CreditCard, Settings2, BarChart3, Settings, Menu, X } from "lucide-react";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname() || "";

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Salon Management", href: "/salons", icon: Users },
    { name: "Subscriptions", href: "/subscriptions", icon: CreditCard },
    { name: "AI Engine Settings", href: "/ai-settings", icon: Settings2 },
    { name: "Reports & Analytics", href: "/reports", icon: BarChart3 },
    { name: "Platform Settings", href: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 grid grid-cols-3 items-center sticky top-0 z-30 shadow-sm print:hidden">
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
        md:translate-x-0 md:static md:z-auto print:hidden
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-4 items-center border-b border-gray-100 hidden md:flex">
          <div className="w-10 h-10 bg-[#1877f2] rounded-full flex items-center justify-center text-white font-bold text-xl mr-3 shadow-sm">
            AI
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">AI Salon</span>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link 
                key={item.href}
                onClick={() => setIsOpen(false)} 
                href={item.href} 
                className={`flex items-center px-3 py-2.5 rounded-lg font-medium transition group ${
                  isActive 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 transition ${
                  isActive ? "text-blue-600" : "text-gray-500 group-hover:text-[#1877f2]"
                }`} /> 
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-100 flex flex-col gap-2">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 rounded-full bg-[#1877f2]/10 border border-[#1877f2]/20 flex items-center justify-center text-[#1877f2] font-bold">
              SA
            </div>
            <div className="ml-3">
              <p className="text-sm font-semibold text-gray-900">Super Admin</p>
              <p className="text-xs text-gray-500">System Owner</p>
            </div>
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem('admin_token');
              window.location.href = '/login';
            }}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 transition font-medium text-sm flex items-center"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
