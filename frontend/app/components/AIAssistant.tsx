'use client';

import React, { useState } from 'react';
import { Sparkles, X, Bot, MessageSquare, ChevronRight, HelpCircle, FileText } from 'lucide-react';

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'summarize' | 'questions' | 'terms'>('summarize');
  const [inputText, setInputText] = useState('');
  const [response, setResponse] = useState<string | null>(null);

  const handleAIQuery = () => {
    if (!inputText.trim()) return;
    // Simulated clinical assistant response
    if (activeTab === 'summarize') {
      setResponse(`• Reported Symptoms: ${inputText}\n• Suggested Focus: Note symptom duration and severity shifts for your provider.\n• Note: Not a clinical diagnosis.`);
    } else if (activeTab === 'questions') {
      setResponse(`1. How long should I expect these symptoms to persist?\n2. Are there specific side effects to monitor with any new treatment?\n3. When should I follow up?`);
    } else {
      setResponse(`Explanation for "${inputText}": Medical terminology breakdown simplified for patient understanding.`);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-105 ring-4 ring-blue-500/20"
        >
          <Sparkles className="w-5 h-5 animate-pulse text-blue-200" />
          <span className="text-xs font-bold tracking-wide">Swift AI Assistant</span>
        </button>
      ) : (
        <div className="w-80 sm:w-96 bg-[#0d1424] border border-blue-800/60 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-950 via-[#0a1228] to-[#080d1a] p-4 border-b border-blue-800/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center">
                <Bot className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Clinical AI Companion</h4>
                <p className="text-[10px] text-slate-400">Consultation Prep & Medical Terms</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800/80 bg-slate-950/40 p-1 gap-1">
            <button
              onClick={() => { setActiveTab('summarize'); setResponse(null); }}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition ${activeTab === 'summarize' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Summarize
            </button>
            <button
              onClick={() => { setActiveTab('questions'); setResponse(null); }}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition ${activeTab === 'questions' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Questions
            </button>
            <button
              onClick={() => { setActiveTab('terms'); setResponse(null); }}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition ${activeTab === 'terms' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Define Terms
            </button>
          </div>

          {/* Content Area */}
          <div className="p-4 space-y-3 max-h-80 overflow-y-auto text-xs">
            {activeTab === 'summarize' && (
              <p className="text-[11px] text-slate-400">Paste or type your symptoms to generate a concise summary for your doctor.</p>
            )}
            {activeTab === 'questions' && (
              <p className="text-[11px] text-slate-400">Generates targeted clinical questions based on your upcoming visit reason.</p>
            )}
            {activeTab === 'terms' && (
              <p className="text-[11px] text-slate-400">Enter complex medical terminology or lab abbreviations for plain language definitions.</p>
            )}

            <textarea
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type here..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />

            <button
              onClick={handleAIQuery}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
            >
              Generate Insights <Sparkles className="w-3.5 h-3.5" />
            </button>

            {response && (
              <div className="p-3 bg-blue-950/40 border border-blue-800/50 rounded-xl text-slate-200 whitespace-pre-line text-[11px] animate-in fade-in">
                {response}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}