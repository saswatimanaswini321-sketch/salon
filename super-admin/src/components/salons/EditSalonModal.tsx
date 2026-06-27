"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';

export interface SalonFormData {
  id?: string;
  name: string;
  ownerName: string;
  email: string;
  mobile: string;
  subscriptionId: string;
  gstNumber?: string;
}

interface EditSalonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SalonFormData) => void;
  initialData?: SalonFormData | null;
}

export default function EditSalonModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: EditSalonModalProps) {
  const [formData, setFormData] = useState<SalonFormData>({
    name: '',
    ownerName: '',
    email: '',
    mobile: '',
    subscriptionId: '',
    gstNumber: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        ownerName: '',
        email: '',
        mobile: '',
        subscriptionId: '',
        gstNumber: '',
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden p-4 sm:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-[95%] sm:w-full sm:max-w-lg transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-4 sm:px-6 py-4">
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                {initialData ? 'Edit Salon Profile' : 'Add New Salon'}
              </h3>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4 px-4 sm:px-6 py-5 text-sm">
                <div>
                  <label htmlFor="name" className="block font-medium text-gray-700">Salon Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1.5 block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-[#1877f2] focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="ownerName" className="block font-medium text-gray-700">Owner Name</label>
                    <input
                      type="text"
                      id="ownerName"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleChange}
                      className="mt-1.5 block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-[#1877f2] focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="mobile" className="block font-medium text-gray-700">Mobile Number</label>
                    <input
                      type="tel"
                      id="mobile"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      className="mt-1.5 block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-[#1877f2] focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block font-medium text-gray-700">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1.5 block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-[#1877f2] focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="gstNumber" className="block font-medium text-gray-700">GST Number (Optional)</label>
                  <input
                    type="text"
                    id="gstNumber"
                    name="gstNumber"
                    value={formData.gstNumber || ''}
                    onChange={handleChange}
                    className="mt-1.5 block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-[#1877f2] focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
                  />
                </div>

                <div>
                  <label htmlFor="subscriptionId" className="block font-medium text-gray-700">Subscription Plan</label>
                  <select
                    id="subscriptionId"
                    name="subscriptionId"
                    value={formData.subscriptionId}
                    onChange={handleChange}
                    className="mt-1.5 block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-[#1877f2] focus:outline-none focus:ring-1 focus:ring-[#1877f2] bg-white"
                    required
                  >
                    <option value="" disabled>Select a plan...</option>
                    <option value="uuid-of-starter-plan">Starter Plan</option>
                    <option value="uuid-of-premium-plan">Premium Plan</option>
                    <option value="uuid-of-enterprise-plan">Enterprise Plan</option>
                  </select>
                </div>
              </div>

              <div className="bg-[#f8fafc] px-4 sm:px-6 py-4 sm:flex sm:flex-row-reverse rounded-b-2xl border-t border-gray-100">
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-full border border-transparent bg-[#1877f2] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#166fe5] focus:outline-none sm:ml-3 sm:w-auto transition-colors"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto transition-colors"
                  onClick={onClose}
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
