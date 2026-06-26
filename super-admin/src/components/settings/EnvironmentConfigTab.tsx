"use client";

import { useState, useEffect } from "react";

interface EnvKey {
  id?: string;
  name?: string;
  key: string;
  value: string;
  isEncrypted: boolean;
}

export default function EnvironmentConfigTab() {
  const [keys, setKeys] = useState<EnvKey[]>([]);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Default keys to show if DB is empty
  const defaultKeys = [
    { key: "OPENAI_KEY", name: "OpenAI API Key", value: "", isEncrypted: true },
    { key: "RAZORPAY_KEY_ID", name: "Razorpay Key ID", value: "", isEncrypted: false },
    { key: "RAZORPAY_KEY_SECRET", name: "Razorpay Key Secret", value: "", isEncrypted: true },
    { key: "AWS_S3_BUCKET", name: "AWS S3 Bucket", value: "", isEncrypted: false },
    { key: "SMTP_HOST", name: "SMTP Host (e.g. smtp.gmail.com)", value: "", isEncrypted: false },
    { key: "SMTP_PORT", name: "SMTP Port (e.g. 587)", value: "", isEncrypted: false },
    { key: "SMTP_USER", name: "SMTP Username", value: "", isEncrypted: false },
    { key: "SMTP_PASSWORD", name: "SMTP Password", value: "", isEncrypted: true },
    { key: "SMTP_FROM_EMAIL", name: "Sender Email Address", value: "", isEncrypted: false },
  ];

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const res = await fetch("http://localhost:3001/platform-settings/config");
      const data = await res.json();
      
      // Merge fetched data with default structure to ensure our 3 critical keys are always visible
      const mergedKeys = defaultKeys.map(defKey => {
        const found = data.find((d: any) => d.key === defKey.key);
        return found ? { ...defKey, ...found, id: found.id || defKey.key } : { ...defKey, id: defKey.key };
      });
      
      setKeys(mergedKeys);
    } catch (error) {
      console.error("Failed to fetch configs:", error);
      // Fallback to default structure for UI if backend is offline
      setKeys(defaultKeys.map(k => ({...k, id: k.key})));
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = (id: string) => {
    setVisibleKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleValueChange = (id: string, newValue: string) => {
    setKeys(keys.map(k => k.id === id ? { ...k, value: newValue } : k));
  };

  const handleSave = async (item: EnvKey) => {
    setSaving(true);
    try {
      await fetch("http://localhost:3001/platform-settings/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: item.key,
          value: item.value,
          isEncrypted: item.isEncrypted
        }),
      });
      alert(`Successfully saved ${item.name}`);
      await fetchConfigs(); // Refresh to get masked value if encrypted
    } catch (error) {
      alert(`Failed to save ${item.name}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading configurations...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Environment Variables</h2>
        <p className="text-sm text-gray-500 mt-1">Manage dynamic API keys and system configurations securely.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
                <th className="py-3 px-4 font-medium">Service Name</th>
                <th className="py-3 px-4 font-medium">Key Identifier</th>
                <th className="py-3 px-4 font-medium">Value</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {keys.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-4">
                    <span className="font-medium text-gray-900">{item.name || item.key}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-mono">{item.key}</span>
                  </td>
                  <td className="py-4 px-4 max-w-xs">
                    <div className="flex items-center space-x-2">
                      <input
                        type={!visibleKeys[item.id!] ? "password" : "text"}
                        value={item.value || ""}
                        onChange={(e) => handleValueChange(item.id!, e.target.value)}
                        placeholder="Enter value..."
                        className="bg-transparent border border-gray-200 rounded px-2 py-1 outline-none w-full text-gray-700 font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end space-x-3">
                        <button
                          onClick={() => toggleVisibility(item.id!)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title="Toggle Visibility"
                        >
                          {visibleKeys[item.id!] ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                          )}
                        </button>
                      <button 
                        onClick={() => handleSave(item)}
                        disabled={saving}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors disabled:opacity-50"
                      >
                        Save
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
