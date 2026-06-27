"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Edit2, Eye, CheckCircle2, Clock, ShieldAlert, ChevronLeft, ChevronRight, ChevronDown, Mail, Phone, Trash2 } from 'lucide-react';
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
      {/* Mobile Card View (hidden on lg and up) */}
      <div className="lg:hidden flex flex-col gap-4 p-4 bg-gray-50/50">
        {data.map((salon) => (
          <div key={salon.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 relative flex flex-col gap-4">
            
            {/* Header: Avatar, Name, Status */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-12 w-12 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-lg ${getAvatarColor(salon.name)}`}>
                  {salon.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <Link href={`/salons/${salon.id}`} className="font-bold text-base text-gray-900 hover:text-[#1877f2] transition-colors leading-tight">
                    {salon.name}
                  </Link>
                  <div className="text-xs text-gray-500 mt-0.5">ID: {salon.userId}</div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {getStatusBadge(salon.status)}
                {getPlanBadge(salon.subscriptionId)}
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm bg-gray-50/50 rounded-lg p-3 border border-gray-100">
              <div>
                <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Owner</span>
                <span className="font-semibold text-gray-700">{salon.ownerName}</span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Joined</span>
                <span className="font-medium text-gray-700">
                  {new Date(salon.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div className="col-span-2">
                <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Contact</span>
                <div className="flex flex-col gap-1 mt-1">
                  <span className="font-medium text-gray-700 flex items-start gap-1.5 break-all"><Mail className="w-3.5 h-3.5 flex-shrink-0 text-gray-400 mt-0.5" />{salon.email}</span>
                  <span className="font-medium text-gray-700 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />{salon.mobile}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 relative">
              <Link href={`/salons/${salon.id}`} className="flex-1">
                <button className="w-full h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-[#1877f2] hover:bg-blue-50 transition-colors font-medium text-sm gap-1.5">
                  <Eye className="h-4 w-4" /> View
                </button>
              </Link>
              <button 
                onClick={() => onEdit(salon)}
                className="flex-1 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-[#1877f2] hover:bg-blue-50 transition-colors font-medium text-sm gap-1.5"
              >
                <Edit2 className="h-4 w-4" /> Edit
              </button>
              <button 
                onClick={() => onDelete(salon)}
                className="flex-1 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors font-medium text-sm gap-1.5"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <div className="p-8 text-center bg-white rounded-xl border border-gray-200 text-gray-500">
            No salons found matching your filters.
          </div>
        )}
      </div>

      {/* Desktop Table View (hidden on mobile and tablet) */}
      <div className="hidden lg:block w-full pb-24">
        <table className="min-w-full text-left border-collapse table-fixed w-full">
          <thead>
            <tr>
              <th scope="col" className="w-[22%] px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Salon Info</th>
              <th scope="col" className="w-[15%] px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Owner</th>
              <th scope="col" className="w-[20%] px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
              <th scope="col" className="w-[10%] px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Plan</th>
              <th scope="col" className="w-[10%] px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="w-[13%] px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined Date</th>
              <th scope="col" className="w-[10%] px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 border-t border-gray-100">
            {data.map((salon) => (
              <tr key={salon.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-3 py-3 align-top">
                  <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-sm mt-0.5 ${getAvatarColor(salon.name)}`}>
                      {salon.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-[14px] text-gray-900 leading-tight truncate">
                        <Link href={`/salons/${salon.id}`} className="hover:text-[#1877f2] transition-colors" title={salon.name}>
                          {salon.name}
                        </Link>
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5 truncate" title={salon.userId}>{salon.userId}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 align-top text-[13px] text-gray-700 font-medium break-words">
                  {salon.ownerName}
                </td>
                <td className="px-3 py-3 align-top">
                  <div className="text-[13px] text-gray-900 font-medium leading-tight flex items-start gap-1.5 break-all">
                    <Mail className="w-3.5 h-3.5 flex-shrink-0 text-gray-400 mt-0.5"/> 
                    <span className="line-clamp-2" title={salon.email}>{salon.email}</span>
                  </div>
                  <div className="text-[12px] text-gray-500 mt-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 flex-shrink-0 text-gray-400"/> 
                    {salon.mobile}
                  </div>
                </td>
                <td className="px-3 py-3 align-top">
                  {getPlanBadge(salon.subscriptionId)}
                </td>
                <td className="px-3 py-3 align-top">
                  {getStatusBadge(salon.status)}
                </td>
                <td className="px-3 py-3 align-top text-[13px] text-gray-700 font-medium whitespace-nowrap">
                  {new Date(salon.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </td>
                <td className="px-3 py-3 align-top text-right">
                  <div className="flex items-center justify-end gap-1.5 relative">
                    <Link href={`/salons/${salon.id}`}>
                      <button className="h-7 w-7 rounded border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#1877f2] hover:border-blue-200 hover:bg-blue-50 transition-colors" title="View">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </Link>
                    <button 
                      onClick={() => onEdit(salon)}
                      className="h-7 w-7 rounded border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#1877f2] hover:border-blue-200 hover:bg-blue-50 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={() => onDelete(salon)}
                      className="h-7 w-7 rounded border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            
            {data.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-12 text-center text-gray-500">
                  No salons found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer (Responsive Grid) */}
      <div className="border-t border-gray-100 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
        <div className="text-[13px] text-gray-500 font-medium w-full sm:w-auto text-center sm:text-left">
          Showing {startItem} to {endItem} of {totalItems}
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center sm:justify-end">
          <div className="flex items-center justify-center gap-1">
            <button 
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8 rounded flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            {currentPage > 2 && totalPages > 3 && (
              <div className="hidden sm:flex items-center">
                <button onClick={() => onPageChange(1)} className="h-8 w-8 rounded flex items-center justify-center text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors">1</button>
                {currentPage > 3 && <span className="text-gray-400 px-1">...</span>}
              </div>
            )}

            {getPageNumbers().map(num => (
              <button 
                key={num}
                onClick={() => onPageChange(num)}
                className={`h-8 w-8 rounded flex items-center justify-center font-medium text-sm transition-colors ${
                  currentPage === num 
                    ? 'bg-[#1877f2] text-white shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {num}
              </button>
            ))}

            {currentPage < totalPages - 1 && totalPages > 3 && (
              <div className="hidden sm:flex items-center">
                {currentPage < totalPages - 2 && <span className="text-gray-400 px-1">...</span>}
                <button onClick={() => onPageChange(totalPages)} className="h-8 w-8 rounded flex items-center justify-center text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors">{totalPages}</button>
              </div>
            )}

            <button 
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="h-8 w-8 rounded flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          
          <div className="relative w-full sm:w-auto mt-2 sm:mt-0">
            <select 
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="w-full sm:w-auto appearance-none flex items-center gap-2 h-9 sm:h-8 pl-3 pr-8 rounded-lg border border-gray-200 text-[13px] font-medium text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#1877f2] transition-colors cursor-pointer bg-white"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
            </select>
            <ChevronDown className="h-3.5 w-3.5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
