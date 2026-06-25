"use client";

import { useState, useEffect, useRef } from "react";

interface Salon {
  id: string;
  name: string;
}

export default function WhiteLabelTab() {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [selectedSalonId, setSelectedSalonId] = useState<string>("");
  const [domain, setDomain] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch the list of salons on mount
  useEffect(() => {
    const fetchSalons = async () => {
      try {
        const res = await fetch(`http://localhost:3001/platform-settings/salons`);
        if (res.ok) {
          const data = await res.json();
          setSalons(data);
          // If there's at least one salon, auto-select it or just wait for the user to select
          if (data.length === 0) {
            // For MVP testing if database is completely empty, provide a dummy option
            setSalons([{ id: 'default-salon-id', name: 'Demo Salon (Default)' }]);
            setSelectedSalonId('default-salon-id');
          }
        }
      } catch (error) {
        console.error("Failed to fetch salons:", error);
        // Fallback for MVP testing
        setSalons([{ id: 'default-salon-id', name: 'Demo Salon (Default)' }]);
        setSelectedSalonId('default-salon-id');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSalons();
  }, []);

  // 2. Fetch the White Label config whenever the selected salon changes
  useEffect(() => {
    if (!selectedSalonId) {
      setDomain("");
      setLogoPreview(null);
      setLogoFile(null);
      return;
    }

    const fetchConfig = async () => {
      setLoadingConfig(true);
      try {
        const res = await fetch(`http://localhost:3001/platform-settings/whitelabel/${selectedSalonId}`);
        if (res.ok) {
          const text = await res.text();
          if (text) {
            const data = JSON.parse(text);
            setDomain(data.domain || "");
            setLogoPreview(data.logoUrl || null);
          } else {
            setDomain("");
            setLogoPreview(null);
          }
        }
      } catch (error) {
        console.error("Failed to fetch whitelabel config:", error);
      } finally {
        setLoadingConfig(false);
      }
    };
    
    fetchConfig();
  }, [selectedSalonId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      const objectUrl = URL.createObjectURL(file);
      setLogoPreview(objectUrl);
    }
  };

  const triggerFileInput = () => {
    if (!selectedSalonId) {
      alert("Please select a salon first.");
      return;
    }
    fileInputRef.current?.click();
  };

  const handleRemoveLogo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (!selectedSalonId) return;

    setSaving(true);
    try {
      const simulatedLogoUrl = logoPreview; 
      await fetch(`http://localhost:3001/platform-settings/whitelabel/${selectedSalonId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain,
          logoUrl: simulatedLogoUrl
        }),
      });
      alert("Successfully saved White Label Settings");
    } catch (error) {
      alert("Failed to save White Label Settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading configurations...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">White Label Management</h2>
        <p className="text-sm text-gray-500 mt-1">Configure custom domains and brand logos for your enterprise clients.</p>
      </div>

      <div className="max-w-3xl bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-6 border-b border-gray-100 pb-4">Client Selection</h3>
        
        <div className="space-y-6">
          {/* Salon Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Select Enterprise Client</label>
            <select
              value={selectedSalonId}
              onChange={(e) => setSelectedSalonId(e.target.value)}
              className="block w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm outline-none transition-colors bg-white text-gray-900"
            >
              <option value="">-- Select a Salon to Configure --</option>
              {salons.map((salon) => (
                <option key={salon.id} value={salon.id}>
                  {salon.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectedSalonId && !loadingConfig && (
        <div className="max-w-3xl bg-white border border-gray-200 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-lg font-medium text-gray-900 mb-6 border-b border-gray-100 pb-4">Brand Assets & Domain</h3>
          
          <div className="space-y-8">
            {/* Logo Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">Company Logo</label>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/png, image/jpeg, image/gif" 
                className="hidden" 
              />
              
              <div 
                onClick={triggerFileInput}
                className={`relative flex justify-center px-6 pt-8 pb-8 border-2 border-dashed rounded-xl transition-all cursor-pointer group ${
                  logoPreview ? 'border-blue-300 bg-blue-50/30' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
                }`}
              >
                {logoPreview ? (
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 mb-4 bg-white rounded-lg p-2 shadow-sm border border-gray-100 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={logoPreview} alt="Logo Preview" className="max-w-full max-h-full object-contain rounded" />
                      <button 
                        onClick={handleRemoveLogo}
                        className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 shadow hover:bg-red-600 transition-colors"
                        title="Remove Logo"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                    </div>
                    <p className="text-sm font-medium text-blue-600">Click to change logo</p>
                  </div>
                ) : (
                  <div className="space-y-2 text-center">
                    <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <svg className="h-8 w-8 text-blue-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="flex text-sm text-gray-600 justify-center">
                      <span className="font-medium text-blue-600">Click to upload</span>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB (Recommended: 512x512)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Custom Domain Section */}
            <div className="pt-2">
              <label className="block text-sm font-medium text-gray-900 mb-3">Custom Domain</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                </div>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm outline-none transition-colors text-gray-900"
                  placeholder="e.g., app.yourdomain.com"
                />
              </div>
              
              <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-100">
                <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-1.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Setup Instructions
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  To link your domain, log into your DNS provider and create a <span className="font-semibold text-gray-900">CNAME</span> record pointing the custom domain to:
                </p>
                <div className="mt-3 flex items-center">
                  <code className="bg-white border border-gray-200 px-3 py-1.5 rounded text-blue-700 font-mono text-sm shadow-sm select-all">
                    cname.aisalons.com
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {selectedSalonId && (
        <div className="flex justify-end pt-4 max-w-3xl">
          <button 
            onClick={handleSave}
            disabled={saving || loadingConfig}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md flex items-center space-x-2 disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            <span>{saving ? "Saving..." : "Save Brand Settings"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
