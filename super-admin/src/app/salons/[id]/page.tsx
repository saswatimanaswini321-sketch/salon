"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Building2, Mail, Phone, Calendar, CreditCard } from 'lucide-react';
import BranchesList, { Branch } from '../../../components/salons/BranchesList';
import EditSalonModal, { SalonFormData } from '../../../components/salons/EditSalonModal';

// Mock data based on the ID
const MOCK_SALON_DETAIL = {
  id: 'uuid-1',
  name: 'Elite Cuts',
  ownerName: 'John Doe',
  email: 'john@elitecuts.com',
  mobile: '+1234567890',
  subscriptionId: 'premium-plan',
  status: 'ACTIVE',
  createdAt: '2026-06-20T10:00:00Z',
};

const MOCK_BRANCHES: Branch[] = [
  { id: 'branch-1', name: 'Downtown Branch', address: '123 Main St, City Center', timings: '9 AM - 8 PM' },
  { id: 'branch-2', name: 'Northside Mall', address: '456 North Mall Road', timings: '10 AM - 9 PM' },
];

export default function SalonDetailPage() {
  const params = useParams();
  const salonId = params.id as string;

  const [salon, setSalon] = useState(MOCK_SALON_DETAIL);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleSaveSalon = (data: SalonFormData) => {
    // Simulate PUT /admin/salons/:id
    setSalon({ ...salon, ...data });
    setIsEditModalOpen(false);
  };

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="mb-8">
        <Link href="/salons" className="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-4 font-medium">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Salons
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
              {salon.name}
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${salon.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                {salon.status}
              </span>
            </h1>
            <p className="mt-1 text-sm text-gray-500 flex items-center gap-1.5">
              <Building2 className="w-4 h-4" /> Tenant ID: {salonId}
            </p>
          </div>
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center justify-center bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all shadow-sm font-medium"
          >
            Edit Profile
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Salon Profile Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-3">Owner Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Owner Name</p>
                <p className="font-medium text-gray-900 mt-0.5">{salon.ownerName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Email Address</p>
                <p className="text-gray-700 flex items-center gap-2 mt-0.5">
                  <Mail className="w-4 h-4 text-gray-400" /> {salon.email}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Mobile Number</p>
                <p className="text-gray-700 flex items-center gap-2 mt-0.5">
                  <Phone className="w-4 h-4 text-gray-400" /> {salon.mobile}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-3">Account Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Subscription Plan</p>
                <p className="text-gray-700 flex items-center gap-2 mt-0.5 capitalize">
                  <CreditCard className="w-4 h-4 text-gray-400" /> {salon.subscriptionId.replace('-plan', '')} Plan
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Joined Date</p>
                <p className="text-gray-700 flex items-center gap-2 mt-0.5">
                  <Calendar className="w-4 h-4 text-gray-400" /> 
                  {new Date(salon.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Branches & Staff */}
        <div className="lg:col-span-2">
          <BranchesList salonId={salonId} branches={MOCK_BRANCHES} />
        </div>
      </div>

      <EditSalonModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveSalon}
        initialData={salon}
      />
    </div>
  );
}
