"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Users, Edit2, X, Check, Save } from 'lucide-react';

export interface Branch {
  id: string;
  name: string;
  address: string;
  timings: string;
}

export interface Staff {
  id: string;
  role: string;
  name: string;
  email: string;
}

// Mock API Call
const MOCK_STAFF: Record<string, Staff[]> = {
  'branch-1': [
    { id: 'u-1', role: 'barber', name: 'Mike Stylist', email: 'mike@elitecuts.com' },
    { id: 'u-2', role: 'manager', name: 'Sarah Connor', email: 'sarah@elitecuts.com' }
  ],
  'branch-2': [
    { id: 'u-3', role: 'barber', name: 'Tom Hardy', email: 'tom@elitecuts.com' }
  ]
};

interface BranchesListProps {
  salonId: string;
  branches: Branch[];
}

export default function BranchesList({ salonId, branches }: BranchesListProps) {
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Branch>>({});
  
  const [expandedBranchId, setExpandedBranchId] = useState<string | null>(null);
  const [staffData, setStaffData] = useState<Record<string, Staff[]>>(MOCK_STAFF); // Using mock initial data

  const handleEditClick = (branch: Branch, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingBranchId(branch.id);
    setEditForm(branch);
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Simulate PUT /admin/salons/:salonId/branches/:branchId
    console.log('Saving branch:', editForm);
    setEditingBranchId(null);
  };

  const toggleBranch = (branchId: string) => {
    if (editingBranchId) return; // Prevent toggle while editing
    
    if (expandedBranchId === branchId) {
      setExpandedBranchId(null);
    } else {
      setExpandedBranchId(branchId);
      // Here you would normally fetch staff: GET /admin/salons/:salonId/branches/:branchId/staff
      // For now, we rely on the mock data
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Physical Branches</h3>
        <button className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors font-medium">
          + Add Branch
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {branches.map((branch, index) => {
          const isEditing = editingBranchId === branch.id;
          const isExpanded = expandedBranchId === branch.id;
          const staff = staffData[branch.id] || [];

          return (
            <motion.div
              key={branch.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-xl border ${isExpanded ? 'border-indigo-300 ring-1 ring-indigo-300' : 'border-gray-200'} bg-white shadow-sm overflow-hidden transition-all`}
            >
              {/* Branch Header Row */}
              <div 
                className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/50 ${isExpanded ? 'bg-indigo-50/30' : ''}`}
                onClick={() => toggleBranch(branch.id)}
              >
                {isEditing ? (
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3" onClick={e => e.stopPropagation()}>
                    <input 
                      type="text" 
                      value={editForm.name} 
                      onChange={e => setEditForm({...editForm, name: e.target.value})}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border" 
                      placeholder="Branch Name"
                    />
                    <input 
                      type="text" 
                      value={editForm.address} 
                      onChange={e => setEditForm({...editForm, address: e.target.value})}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border" 
                      placeholder="Address"
                    />
                    <input 
                      type="text" 
                      value={editForm.timings} 
                      onChange={e => setEditForm({...editForm, timings: e.target.value})}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border" 
                      placeholder="Timings"
                    />
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                    <div>
                      <h4 className="font-medium text-gray-900">{branch.name}</h4>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="h-3.5 w-3.5" /> {branch.address}
                      </p>
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-400" /> {branch.timings}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 sm:ml-4">
                  {isEditing ? (
                    <>
                      <button onClick={handleSaveClick} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors">
                        <Save className="h-4 w-4" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setEditingBranchId(null); }} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600 flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        {staff.length} Staff
                      </div>
                      <button onClick={(e) => handleEditClick(branch, e)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Staff Dropdown View */}
              <AnimatePresence>
                {isExpanded && !isEditing && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-100 bg-gray-50/50"
                  >
                    <div className="p-5">
                      <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Branch Staff</h5>
                      {staff.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {staff.map(member => (
                            <div key={member.id} className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                {member.name.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                                <p className="text-xs text-gray-500 truncate">{member.role} • {member.email}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No staff assigned to this branch yet.</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
