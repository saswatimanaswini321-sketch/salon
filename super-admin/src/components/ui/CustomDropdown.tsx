"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface Option {
  label: string;
  value: string;
}

interface CustomDropdownProps {
  value: string;
  onChange: (val: string) => void;
  options: Option[];
  icon?: ReactNode;
  className?: string;
}

export default function CustomDropdown({ value, onChange, options, icon, className = "" }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      {icon && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          {icon}
        </div>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full min-w-[130px] appearance-none pl-9 pr-8 py-1.5 bg-[#f0f2f5] border border-transparent rounded-full text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1877f2] cursor-pointer text-left flex items-center justify-between transition-colors`}
      >
        <span className="truncate mr-2">{selectedOption?.label || value}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 min-w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-50 focus:bg-gray-50 outline-none whitespace-nowrap ${
                value === option.value ? "text-[#1877f2] bg-blue-50/50 hover:bg-blue-50/80" : "text-gray-700"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
