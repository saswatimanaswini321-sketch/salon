"use client";

import { useState, useEffect, useRef } from "react";

export default function CMSTab() {
  const [activePage, setActivePage] = useState("Home Page");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const pages = ["Home Page", "Pricing", "About Us", "FAQ", "Privacy Policy", "Terms of Service"];

  useEffect(() => {
    fetchPageContent(activePage);
  }, [activePage]);

  const fetchPageContent = async (pageName: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/platform-settings/cms/${encodeURIComponent(pageName)}`);
      if (res.ok) {
        const text = await res.text();
        if (text) {
          const data = JSON.parse(text);
          if (data && data.content && data.content.html) {
            if (editorRef.current) editorRef.current.innerHTML = data.content.html;
            setLoading(false);
            return;
          }
        }
      }
      
      // Default placeholder if empty
      const defaultContent = `
        <h1 style="font-size: 1.875rem; font-weight: bold; margin-bottom: 1rem;">Welcome to AI Salon - ${pageName}</h1>
        <p style="margin-bottom: 1rem;">This is the default content for the ${pageName}. You can edit this text directly in the browser.</p>
        <p>Try selecting text and using the toolbar above to make it <b>bold</b>, <i>italic</i>, or add headings!</p>
      `;
      if (editorRef.current) editorRef.current.innerHTML = defaultContent;
      
    } catch (error) {
      console.error("Failed to fetch CMS content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editorRef.current) return;
    const newHtml = editorRef.current.innerHTML;
    
    setSaving(true);
    try {
      await fetch("http://localhost:3001/platform-settings/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageName: activePage,
          content: { html: newHtml }
        }),
      });
      alert(`Successfully published ${activePage}`);
    } catch (error) {
      alert(`Failed to save ${activePage}`);
    } finally {
      setSaving(false);
    }
  };

  // formatting commands for contentEditable
  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col md:flex-row gap-6 md:gap-8">
      
      {/* Navigation - Horizontal scroll on mobile, Sidebar on desktop */}
      <div className="w-full md:w-64 flex-shrink-0">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 px-1">CMS Pages</h2>
        <nav className="flex overflow-x-auto md:flex-col gap-2 md:gap-1 pb-2 md:pb-0 hide-scrollbar">
          {pages.map((page) => (
            <button
              key={page}
              onClick={() => setActivePage(page)}
              className={`flex-shrink-0 md:w-full text-left px-4 py-2.5 md:py-3 rounded-lg text-sm font-medium transition-colors border whitespace-nowrap ${
                activePage === page
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-white text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-900 hover:border-gray-200 shadow-sm md:shadow-none"
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{page}</span>
                {activePage === page && (
                  <svg className="hidden md:block w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                )}
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Editor Area */}
      <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col min-h-[500px] md:h-[650px] overflow-hidden">
        <div className="border-b border-gray-200 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between bg-white gap-3 sm:gap-0">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Editing: {activePage}</h3>
            {loading && <p className="text-xs text-blue-500 mt-1 font-medium animate-pulse">Loading content...</p>}
          </div>
          <button 
            onClick={handleSave}
            disabled={saving || loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center space-x-2 w-full sm:w-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
            <span>{saving ? "Publishing..." : "Publish Changes"}</span>
          </button>
        </div>
        
        {/* Active WYSIWYG Toolbar */}
        <div className="border-b border-gray-200 px-4 py-3 flex flex-wrap gap-2 items-center bg-gray-50/50">
          <div className="flex items-center space-x-1 border-r border-gray-200 pr-2">
            <button onClick={() => formatText('bold')} className="p-2 text-gray-700 hover:bg-gray-200 hover:text-gray-900 rounded transition-colors font-serif font-bold w-9 h-9 flex items-center justify-center" title="Bold">B</button>
            <button onClick={() => formatText('italic')} className="p-2 text-gray-700 hover:bg-gray-200 hover:text-gray-900 rounded transition-colors font-serif italic w-9 h-9 flex items-center justify-center" title="Italic">I</button>
            <button onClick={() => formatText('underline')} className="p-2 text-gray-700 hover:bg-gray-200 hover:text-gray-900 rounded transition-colors font-serif underline w-9 h-9 flex items-center justify-center" title="Underline">U</button>
          </div>
          
          <div className="flex items-center space-x-1 border-r border-gray-200 pr-2">
            <button onClick={() => formatText('formatBlock', 'H1')} className="p-2 text-gray-700 hover:bg-gray-200 hover:text-gray-900 rounded transition-colors font-semibold text-sm h-9 flex items-center justify-center" title="Heading 1">H1</button>
            <button onClick={() => formatText('formatBlock', 'H2')} className="p-2 text-gray-700 hover:bg-gray-200 hover:text-gray-900 rounded transition-colors font-medium text-sm h-9 flex items-center justify-center" title="Heading 2">H2</button>
            <button onClick={() => formatText('formatBlock', 'P')} className="p-2 text-gray-700 hover:bg-gray-200 hover:text-gray-900 rounded transition-colors font-normal text-sm h-9 flex items-center justify-center" title="Paragraph">¶</button>
          </div>

          <div className="flex items-center space-x-1">
            <button onClick={() => formatText('insertUnorderedList')} className="p-2 text-gray-700 hover:bg-gray-200 hover:text-gray-900 rounded transition-colors h-9 w-9 flex items-center justify-center" title="Bullet List">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16M4 6h.01M4 12h.01M4 18h.01"></path></svg>
            </button>
            <button onClick={() => formatText('insertOrderedList')} className="p-2 text-gray-700 hover:bg-gray-200 hover:text-gray-900 rounded transition-colors h-9 w-9 flex items-center justify-center" title="Numbered List">
              <span className="font-mono text-xs font-bold">1.</span>
            </button>
          </div>
        </div>

        {/* Text Area */}
        <div className="flex-1 p-4 sm:p-6 bg-gray-100 overflow-y-auto">
          <style dangerouslySetInnerHTML={{__html: `
            .cms-editor h1 { font-size: 2.25rem; font-weight: 700; margin-bottom: 1rem; line-height: 1.2; }
            .cms-editor h2 { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.75rem; line-height: 1.3; }
            .cms-editor p { margin-bottom: 1rem; line-height: 1.6; }
            .cms-editor ul { list-style-type: disc; margin-left: 1.5rem; margin-bottom: 1rem; }
            .cms-editor ol { list-style-type: decimal; margin-left: 1.5rem; margin-bottom: 1rem; }
            .cms-editor b, .cms-editor strong { font-weight: bold; }
            .cms-editor i, .cms-editor em { font-style: italic; }
            .cms-editor u { text-decoration: underline; }
          `}} />
          <div 
            ref={editorRef}
            className="cms-editor bg-white border border-gray-200 rounded-xl shadow-sm min-h-full p-6 sm:p-8 outline-none focus:ring-2 focus:ring-blue-400 transition-all text-gray-800" 
            contentEditable 
            suppressContentEditableWarning
          />
        </div>
      </div>
    </div>
  );
}
