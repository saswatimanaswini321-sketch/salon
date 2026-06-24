"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Store, CreditCard, Settings2, BarChart2, Settings } from "lucide-react";

export default function SidebarNav() {
  const pathname = usePathname() || "";
  
  const links = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutGrid },
    { name: "Salon Management", href: "/salons", icon: Store },
    { name: "Subscriptions", href: "/subscriptions", icon: CreditCard },
    { name: "AI Engine Settings", href: "/ai-settings", icon: Settings2 },
    { name: "Reports & Analytics", href: "/reports", icon: BarChart2 },
    { name: "Platform Settings", href: "/settings", icon: Settings },
  ];

  return (
    <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
      {links.map((link) => {
        const isActive = pathname.startsWith(link.href);
        const Icon = link.icon;
        
        return (
          <Link 
            key={link.name} 
            href={link.href} 
            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-sm font-medium ${
              isActive 
                ? 'bg-[#8b8df2]/10 text-[#8b8df2]' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-[#8b8df2]' : 'text-gray-400'}`} />
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}
