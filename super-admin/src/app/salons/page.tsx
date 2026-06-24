"use client";

import React, { useState, useMemo } from 'react';
import { Plus, Search, ChevronDown, Calendar, Filter, X } from 'lucide-react';
import SalonsTable from '../../components/salons/SalonsTable';
import EditSalonModal, { SalonFormData } from '../../components/salons/EditSalonModal';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';

// Mock data
const MOCK_SALONS = [
  { id: '1', name: 'Elite Scissors', ownerName: 'John Doe', email: 'john@elitescissors.com', mobile: '+1234567890', subscriptionId: 'premium', status: 'ACTIVE' as const, createdAt: '2026-06-20T10:00:00Z', userId: 'user_123' },
  { id: '2', name: 'Cuts & Fades', ownerName: 'Jane Smith', email: 'jane@cutsfades.com', mobile: '+1987654321', subscriptionId: 'starter', status: 'PENDING' as const, createdAt: '2026-06-22T14:30:00Z', userId: 'user_456' },
  { id: '3', name: 'The Glamour Room', ownerName: 'Mike Johnson', email: 'mike@glamourroom.com', mobile: '+1122334455', subscriptionId: 'enterprise', status: 'SUSPENDED' as const, createdAt: '2026-05-15T09:15:00Z', userId: 'user_789' },
  { id: '4', name: 'Urban Edge', ownerName: 'Sarah Wilson', email: 'sarah@urbanedge.com', mobile: '+1098765432', subscriptionId: 'premium', status: 'ACTIVE' as const, createdAt: '2026-05-10T09:15:00Z', userId: 'user_321' },
  { id: '5', name: 'Blade Masters', ownerName: 'David Brown', email: 'david@blademasters.com', mobile: '+1234987650', subscriptionId: 'starter', status: 'ACTIVE' as const, createdAt: '2026-04-28T09:15:00Z', userId: 'user_654' },
  { id: '6', name: 'Classic Cuts', ownerName: 'Tom Hanks', email: 'tom@classiccuts.com', mobile: '+1122446688', subscriptionId: 'starter', status: 'ACTIVE' as const, createdAt: '2026-03-12T09:15:00Z', userId: 'user_999' },
  { id: '7', name: 'Modern Salon', ownerName: 'Emma Stone', email: 'emma@modernsalon.com', mobile: '+1122446699', subscriptionId: 'enterprise', status: 'PENDING' as const, createdAt: '2026-06-23T09:15:00Z', userId: 'user_888' },
];

export default function SalonsPage() {
  const [salons, setSalons] = useState(MOCK_SALONS);
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [planFilter, setPlanFilter] = useState('All Plans');
  const [sortOrder, setSortOrder] = useState('Newest First');
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSalon, setSelectedSalon] = useState<any>(null);
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'suspend' | 'delete' | null>(null);

  // Apply filters, search, and sorting
  const filteredAndSortedSalons = useMemo(() => {
    let result = [...salons];

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.ownerName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'All Status') {
      result = result.filter(s => s.status.toLowerCase() === statusFilter.toLowerCase());
    }

    if (planFilter !== 'All Plans') {
      result = result.filter(s => s.subscriptionId.toLowerCase() === planFilter.toLowerCase());
    }

    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      if (sortOrder === 'Newest First') return dateB - dateA;
      if (sortOrder === 'Oldest First') return dateA - dateB;
      return 0;
    });

    return result;
  }, [salons, searchQuery, statusFilter, planFilter, sortOrder]);

  const totalItems = filteredAndSortedSalons.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  } else if (totalPages === 0 && currentPage !== 1) {
    setCurrentPage(1);
  }

  const paginatedSalons = filteredAndSortedSalons.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  const handleAddSalon = () => {
    setSelectedSalon(null);
    setIsEditModalOpen(true);
  };

  const handleEditSalon = (salon: any) => {
    setSelectedSalon(salon);
    setIsEditModalOpen(true);
  };

  const handleSaveSalon = (data: SalonFormData) => {
    if (selectedSalon) {
      setSalons(prev => prev.map(s => s.id === selectedSalon.id ? { ...s, ...data } : s));
    } else {
      setSalons(prev => [...prev, { ...data, id: `uuid-${Date.now()}`, status: 'ACTIVE', createdAt: new Date().toISOString(), userId: `user_${Math.floor(Math.random() * 1000)}` }]);
    }
    setIsEditModalOpen(false);
  };

  const handleSuspendClick = (salon: any) => {
    setSelectedSalon(salon);
    setConfirmAction('suspend');
    setIsConfirmOpen(true);
  };

  const handleDeleteClick = (salon: any) => {
    setSelectedSalon(salon);
    setConfirmAction('delete');
    setIsConfirmOpen(true);
  };

  const executeConfirmAction = () => {
    if (!selectedSalon) return;
    if (confirmAction === 'suspend') {
      const newStatus = selectedSalon.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      setSalons(prev => prev.map(s => s.id === selectedSalon.id ? { ...s, status: newStatus } : s));
    } else if (confirmAction === 'delete') {
      setSalons(prev => prev.filter(s => s.id !== selectedSalon.id));
    }
    setIsConfirmOpen(false);
    setSelectedSalon(null);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Salon Managements</h1>
        <button 
          onClick={handleAddSalon}
          className="inline-flex items-center justify-center gap-2 bg-[#1877f2] hover:bg-[#166fe5] text-white px-5 py-2.5 rounded-full transition-all shadow-sm font-semibold text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Salon
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-gray-100 flex flex-col h-auto overflow-hidden">
        
        {/* Filters Bar Row */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row items-center gap-3 w-full bg-white z-10 shadow-sm">
          
          <div className="relative flex-1 w-full min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by salon or owner name..."
              className="w-full pl-9 pr-4 py-2 bg-[#f0f2f5] border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#1877f2] font-medium text-gray-700 placeholder-gray-400"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
            }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Filter className="w-4 h-4 text-gray-400" />
              </div>
              <select 
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="appearance-none pl-9 pr-8 py-2 bg-[#f0f2f5] border-none rounded-full text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1877f2] cursor-pointer"
              >
                <option value="All Status">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Filter className="w-4 h-4 text-gray-400" />
              </div>
              <select 
                value={planFilter}
                onChange={(e) => { setPlanFilter(e.target.value); setCurrentPage(1); }}
                className="appearance-none pl-9 pr-8 py-2 bg-[#f0f2f5] border-none rounded-full text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1877f2] cursor-pointer"
              >
                <option value="All Plans">All Plans</option>
                <option value="Premium">Premium</option>
                <option value="Starter">Starter</option>
                <option value="Enterprise">Enterprise</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative hidden md:block">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Calendar className="w-4 h-4 text-gray-400" />
              </div>
              <select 
                value={sortOrder}
                onChange={(e) => { setSortOrder(e.target.value); setCurrentPage(1); }}
                className="appearance-none pl-9 pr-8 py-2 bg-[#f0f2f5] border-none rounded-full text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1877f2] cursor-pointer"
              >
                <option value="Newest First">Newest</option>
                <option value="Oldest First">Oldest</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {(searchQuery || statusFilter !== 'All Status' || planFilter !== 'All Plans') && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('All Status');
                  setPlanFilter('All Plans');
                  setSortOrder('Newest First');
                  setCurrentPage(1);
                }}
                className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-full transition-colors"
                title="Clear Filters"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        {/* Table Area */}
        <div className="w-full bg-white">
          <SalonsTable 
            data={paginatedSalons} 
            onEdit={handleEditSalon}
            onSuspendToggle={handleSuspendClick}
            onDelete={handleDeleteClick}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={(val) => {
              setItemsPerPage(val);
              setCurrentPage(1);
            }}
            totalItems={totalItems}
          />
        </div>
      </div>

      {/* Modals */}
      <EditSalonModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onSave={handleSaveSalon}
        initialData={selectedSalon}
      />

      <ConfirmationDialog 
        isOpen={isConfirmOpen}
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={executeConfirmAction}
        title={confirmAction === 'delete' ? 'Delete Salon' : selectedSalon?.status === 'ACTIVE' ? 'Suspend Salon' : 'Reactivate Salon'}
        description={
          confirmAction === 'delete' 
            ? `Are you sure you want to permanently delete ${selectedSalon?.name}? This action cannot be undone.`
            : `Are you sure you want to ${selectedSalon?.status === 'ACTIVE' ? 'suspend' : 'reactivate'} ${selectedSalon?.name}?`
        }
        confirmText={confirmAction === 'delete' ? 'Delete Permanently' : selectedSalon?.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
        variant={confirmAction === 'delete' ? 'danger' : 'warning'}
      />
    </div>
  );
}
