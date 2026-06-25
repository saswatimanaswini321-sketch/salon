"use client";

import { useState, useEffect } from "react";
import { AiEngineApi, AiSetting, AiPrompt } from "@/lib/aiApi";
import { Settings, MessageSquare, Image as ImageIcon, Save, Loader2, Key, Upload } from "lucide-react";

const STYLE_MAPPINGS: Record<string, Record<string, string[]>> = {
  MALE: {
    HAIR_STYLE: ["Fade Cut", "Buzz Cut", "Undercut", "Pompadour", "Crew Cut"],
    BEARD_STYLE: ["French Beard", "Full Beard", "Stubble"],
    HAIR_COLOR: ["Blonde", "Brown", "Burgundy", "Silver", "Fashion Colors"],
  },
  FEMALE: {
    HAIR_STYLE: ["Layer Cut", "Bob Cut", "Pixie Cut", "Balayage", "Highlights"],
    BEARD_STYLE: [],
    HAIR_COLOR: ["Blonde", "Brown", "Burgundy", "Silver", "Fashion Colors"],
  }
};

export default function AISettings() {
  const [activeTab, setActiveTab] = useState<"config" | "prompts" | "demo">("config");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState<Record<string, string>>({
    OPENAI_KEY: "",
    CLAUDE_KEY: "",
    DEFAULT_AI_MODEL: "GPT4",
  });
  
  const [prompts, setPrompts] = useState<AiPrompt[]>([]);
  
  // Demo State
  const [demoInput, setDemoInput] = useState({ gender: "MALE", styleType: "HAIR_STYLE", styleName: "Fade Cut", salonId: "test-salon-123", image: "" });
  const [demoImagePreview, setDemoImagePreview] = useState<string | null>(null);
  const [demoResult, setDemoResult] = useState<any>(null);
  const [demoLoading, setDemoLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedSettings, fetchedPrompts] = await Promise.all([
        AiEngineApi.getSettings(),
        AiEngineApi.getPrompts()
      ]);
      
      const settingsMap: Record<string, string> = { ...settings };
      fetchedSettings.forEach(s => {
        settingsMap[s.key] = s.value;
      });
      setSettings(settingsMap);
      
      if (fetchedPrompts.length === 0) {
        // Mock some default prompts if DB is empty
        setPrompts([
          { id: '1', type: 'HAIR_STYLE', promptText: 'Generate a realistic photo of a [gender] with a [styleName] hairstyle...' },
          { id: '2', type: 'BEARD_STYLE', promptText: 'Generate a realistic photo with a [styleName] beard...' }
        ]);
      } else {
        setPrompts(fetchedPrompts);
      }
    } catch (error) {
      console.error("Error loading AI settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(settings)) {
        await AiEngineApi.updateSetting(key, value);
      }
      alert("Settings saved successfully!");
    } catch (error: any) {
      alert("Error saving settings: " + (error.message || error));
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrompt = async (type: string, text: string) => {
    try {
      await AiEngineApi.updatePrompt(type, text);
      alert(`${type} prompt updated successfully!`);
    } catch (error) {
      alert("Error saving prompt");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setDemoImagePreview(base64String);
        setDemoInput(prev => ({ ...prev, image: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const runDemo = async () => {
    setDemoLoading(true);
    setDemoResult(null);
    try {
      const res = await AiEngineApi.generateImage(demoInput);
      setDemoResult(res);
    } catch (error: any) {
      alert("Error running demo: " + (error.message || error));
      console.error(error);
    } finally {
      setDemoLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Engine Management</h1>
        <p className="text-gray-500">Configure API keys, model routing, master prompts, and audit AI usage.</p>
      </div>

      {/* Tabs Header */}
      <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-gray-200 mb-6">
        <button 
          onClick={() => setActiveTab("config")}
          className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center font-medium transition-all ${activeTab === 'config' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
        >
          <Settings className="w-4 h-4 mr-2" /> Configuration
        </button>
        <button 
          onClick={() => setActiveTab("prompts")}
          className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center font-medium transition-all ${activeTab === 'prompts' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
        >
          <MessageSquare className="w-4 h-4 mr-2" /> Master Prompts
        </button>
        <button 
          onClick={() => setActiveTab("demo")}
          className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center font-medium transition-all ${activeTab === 'demo' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
        >
          <ImageIcon className="w-4 h-4 mr-2" /> Demo & Audit
        </button>
      </div>

      {/* Tabs Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
        
        {/* CONFIG TAB */}
        {activeTab === "config" && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-800">
              <Key className="w-5 h-5 mr-2 text-blue-600" /> API Key Management
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">OpenAI API Key (ChatGPT)</label>
                <input 
                  type="password" 
                  value={settings.OPENAI_KEY} 
                  onChange={(e) => setSettings({...settings, OPENAI_KEY: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="sk-..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Claude API Key</label>
                <input 
                  type="password" 
                  value={settings.CLAUDE_KEY} 
                  onChange={(e) => setSettings({...settings, CLAUDE_KEY: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="sk-ant-..."
                />
              </div>

              <div className="pt-4 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-1">Default AI Model</label>
                <select 
                  value={settings.DEFAULT_AI_MODEL}
                  onChange={(e) => setSettings({...settings, DEFAULT_AI_MODEL: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                >
                  <option value="GPT4">OpenAI GPT-4o</option>
                  <option value="CLAUDE">Anthropic Claude 3.5 Sonnet</option>
                </select>
              </div>

              <div className="pt-6">
                <button 
                  onClick={handleSaveSettings} 
                  disabled={saving}
                  className="flex items-center justify-center w-full md:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-all disabled:opacity-70"
                >
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PROMPTS TAB */}
        {activeTab === "prompts" && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-800">
              <MessageSquare className="w-5 h-5 mr-2 text-blue-600" /> Master Prompts Library
            </h2>
            <div className="space-y-6">
              {prompts.map((prompt) => (
                <div key={prompt.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <label className="block text-sm font-bold text-gray-800 mb-2">{prompt.type}</label>
                  <textarea 
                    value={prompt.promptText}
                    onChange={(e) => {
                      const newPrompts = [...prompts];
                      const index = newPrompts.findIndex(p => p.id === prompt.id);
                      newPrompts[index].promptText = e.target.value;
                      setPrompts(newPrompts);
                    }}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm mb-3"
                  />
                  <div className="flex justify-end">
                    <button 
                      onClick={() => handleSavePrompt(prompt.type, prompt.promptText)}
                      className="px-4 py-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg shadow-sm transition-all text-sm"
                    >
                      Update {prompt.type}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DEMO TAB */}
        {activeTab === "demo" && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-800">
              <ImageIcon className="w-5 h-5 mr-2 text-blue-600" /> AI Generation Demo
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Controls */}
              <div className="space-y-4 bg-gray-50 p-5 rounded-xl border border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select 
                    value={demoInput.gender} 
                    onChange={(e) => {
                      const newGender = e.target.value;
                      const availableTypes = Object.keys(STYLE_MAPPINGS[newGender]).filter(k => STYLE_MAPPINGS[newGender][k].length > 0);
                      const newType = availableTypes.includes(demoInput.styleType) ? demoInput.styleType : availableTypes[0];
                      const newStyles = STYLE_MAPPINGS[newGender][newType];
                      setDemoInput({...demoInput, gender: newGender, styleType: newType, styleName: newStyles[0]});
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Style Type</label>
                  <select 
                    value={demoInput.styleType} 
                    onChange={(e) => {
                      const newType = e.target.value;
                      const newStyles = STYLE_MAPPINGS[demoInput.gender][newType];
                      setDemoInput({...demoInput, styleType: newType, styleName: newStyles[0]});
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="HAIR_STYLE">Hair Style</option>
                    {demoInput.gender === "MALE" && <option value="BEARD_STYLE">Beard Style</option>}
                    <option value="HAIR_COLOR">Hair Color</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Style Name</label>
                  <select 
                    value={demoInput.styleName} 
                    onChange={(e) => setDemoInput({...demoInput, styleName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {STYLE_MAPPINGS[demoInput.gender]?.[demoInput.styleType]?.map(style => (
                      <option key={style} value={style}>{style}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Reference Image (Optional)</label>
                  <div className="flex items-center space-x-4">
                    <label className="cursor-pointer flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 transition-all">
                      <Upload className="w-4 h-4 mr-2 text-gray-500" />
                      Choose File
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                    {demoImagePreview && (
                      <div className="w-10 h-10 rounded-md overflow-hidden border border-gray-200">
                        <img src={demoImagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
                
                <button 
                  onClick={runDemo} 
                  disabled={demoLoading}
                  className="w-full mt-4 flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-all"
                >
                  {demoLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Generate Mock Image"}
                </button>
              </div>

              {/* Output */}
              <div className="flex flex-col items-center justify-center bg-gray-100 rounded-xl border border-gray-200 p-2 min-h-[300px] overflow-hidden relative">
                {demoLoading ? (
                  <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Simulating AI API Call...</p>
                    <p className="text-gray-400 text-xs mt-1">(Deducting 50 tokens from database)</p>
                  </div>
                ) : demoResult ? (
                  <div className="w-full h-full flex flex-col items-center p-2">
                    <img src={demoResult.generatedImage} alt="Generated" className="w-full h-full object-cover rounded-lg shadow-md max-h-[300px]" />
                    <p className="text-green-600 text-sm font-medium mt-3 bg-green-50 px-3 py-1 rounded-full">{demoResult.message}</p>
                  </div>
                ) : (
                  <p className="text-gray-400">Generated image will appear here</p>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
