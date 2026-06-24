"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { MoreVertical, Edit2, Ban, Trash2, Eye, CheckCircle2, Clock, ShieldAlert, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { SalonFormData } from './EditSalonModal';

interface Salon {
  id: string;
  name: string;
  ownerName: string;
  email: string;
  mobile: string;
  subscriptionId: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  createdAt: string;
  userId: string;
}

interface SalonsTableProps {
  data: Salon[];
  onEdit: (salon: Salon) => void;
  onSuspendToggle: (salon: Salon) => void;
  onDelete: (salon: Salon) => void;
  // Pagination Props
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (items: number) => void;
  totalItems: number;
}

export default function SalonsTable({ 
  data, 
  onEdit, 
  onSuspendToggle, 
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalItems
}: SalonsTableProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdown(openDropdown === id ? null : id);
  };

  React.useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 border border-emerald-100">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Active
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600 border border-amber-100">
            <Clock className="h-3.5 w-3.5" />
            Pending
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600 border border-rose-100">
            <ShieldAlert className="h-3.5 w-3.5" />
            Suspended
          </span>
        );
      default:
        return null;
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'premium':
        return <span className="inline-flex items-center rounded-full bg-[#f3e8ff] px-2.5 py-1 text-[11px] font-bold text-[#9333ea]">Premium</span>;
      case 'starter':
        return <span className="inline-flex items-center rounded-full bg-[#e0f2fe] px-2.5 py-1 text-[11px] font-bold text-[#0284c7]">Starter</span>;
      case 'enterprise':
        return <span className="inline-flex items-center rounded-full bg-[#dbeafe] px-2.5 py-1 text-[11px] font-bold text-[#1e40af]">Enterprise</span>;
      default:
        return <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-600 capitalize">{plan}</span>;
    }
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-indigo-100 text-indigo-700',
      'bg-blue-100 text-blue-700',
      'bg-purple-100 text-purple-700',
      'bg-emerald-100 text-emerald-700',
      'bg-rose-100 text-rose-700',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    let start = Math.max(1, currentPage - 1);
    let end = Math.min(totalPages, currentPage + 1);

    if (currentPage === 1) end = Math.min(3, totalPages);
    if (currentPage === totalPages) start = Math.max(1, totalPages - 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex flex-col w-full h-full bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr>
              <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Salon Info</th>
              <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Owner</th>
              <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
              <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Plan</th>
              <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined Date</th>
              <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 border-t border-gray-100">
            {data.map((salon) => (
              <tr key={salon.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-sm ${getAvatarColor(salon.name)}`}>
                      {salon.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-[15px] text-gray-900 leading-tight">
                        <Link href={`/salons/${salon.id}`} className="hover:text-indigo-600 transition-colors">
                          {salon.name}
                        </Link>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{salon.userId}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-700 font-medium">
                  {salon.ownerName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-[14px] text-gray-900 font-medium leading-tight">{salon.email}</div>
                  <div className="text-[13px] text-gray-500 mt-0.5">{salon.mobile}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getPlanBadge(salon.subscriptionId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(salon.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-700 font-medium">
                  {new Date(salon.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2 relative">
                    <Link href={`/salons/${salon.id}`}>
                      <button className="h-8 w-8 rounded border border-gray-200 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                    </Link>
                    <button 
                      onClick={() => onEdit(salon)}
                      className="h-8 w-8 rounded border border-gray-200 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={(e) => toggleDropdown(salon.id, e)}
                      className="h-8 w-8 rounded border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors relative"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {openDropdown === salon.id && (
                      <div className="absolute right-0 top-10 z-10 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenDropdown(null); onSuspendToggle(salon); }}
                          className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Ban className={`mr-3 h-4 w-4 ${salon.status === 'ACTIVE' ? 'text-amber-500' : 'text-emerald-500'}`} />
                          {salon.status === 'ACTIVE' ? 'Suspend Salon' : 'Reactivate Salon'}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenDropdown(null); onDelete(salon); }}
                          className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="mr-3 h-4 w-4 text-red-500" />
                          Delete Salon
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            
            {data.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No salons found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="border-t border-gray-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-[13px] text-gray-500 font-medium">
          Showing {startItem} to {endItem} of {totalItems} salons
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-1">
            <button 
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8 rounded flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            {currentPage > 2 && totalPages > 3 && (
              <>
                <button onClick={() => onPageChange(1)} className="h-8 w-8 rounded flex items-center justify-center text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors">1</button>
                {currentPage > 3 && <span className="text-gray-400 px-1">...</span>}
              </>
            )}

            {getPageNumbers().map(num => (
              <button 
                key={num}
                onClick={() => onPageChange(num)}
                className={`h-8 w-8 rounded flex items-center justify-center font-medium text-sm transition-colors ${
                  currentPage === num 
                    ? 'border border-[#8b8df2] text-[#8b8df2]' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {num}
              </button>
            ))}

            {currentPage < totalPages - 1 && totalPages > 3 && (
              <>
                {currentPage < totalPages - 2 && <span className="text-gray-400 px-1">...</span>}
                <button onClick={() => onPageChange(totalPages)} className="h-8 w-8 rounded flex items-center justify-center text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors">{totalPages}</button>
              </>
            )}

            <button 
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="h-8 w-8 rounded flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          
          <div className="relative">
            <select 
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="appearance-none flex items-center gap-2 h-8 pl-3 pr-8 rounded border border-gray-200 text-[13px] font-medium text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
            <ChevronDown className="h-3.5 w-3.5 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
