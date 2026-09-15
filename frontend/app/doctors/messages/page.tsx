// frontend/app/doctors/messages/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  ShieldCheck,
  Send,
  Paperclip,
  Smile,
  Mic,
  MoreVertical,
  Phone,
  Video,
  FileText,
  Calendar,
  CheckCheck,
  Check,
  AlertCircle,
  Pin,
  Archive,
  Clock,
  User,
  ChevronRight,
  Info,
  Sparkles,
  Stethoscope,
  Pill,
  Download,
  Image as ImageIcon,
  Play,
  X,
  Lock,
  ExternalLink,
  SlidersHorizontal,
  Flame
} from "lucide-react";

interface Message {
  id: string;
  sender: "doctor" | "patient";
  text: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
  attachment?: {
    type: "image" | "pdf" | "prescription" | "lab" | "appointment";
    name: string;
    url?: string;
    meta?: string;
  };
}

interface Conversation {
  id: string;
  patientName: string;
  avatar: string;
  age: number;
  gender: string;
  group: "Today" | "Yesterday" | "Earlier";
  priority: "Emergency" | "High" | "Normal";
  unreadCount: number;
  lastMessage: string;
  timestamp: string;
  online: boolean;
  pinned: boolean;
  archived: boolean;
  allergies: string[];
  medications: string[];
  diagnosis: string;
  upcomingAppointment: string;
  messages: Message[];
}

export default function DoctorMessagesPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "unread" | "priority" | "archived">("all");
  const [selectedChatId, setSelectedChatId] = useState<string>("conv-1");
  const [messageInput, setMessageInput] = useState("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showPatientInfoPanel, setShowPatientInfoPanel] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Realistic Mock Conversations Data
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "conv-1",
      patientName: "Sarah Wanjiku",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      age: 32,
      gender: "Female",
      group: "Today",
      priority: "Emergency",
      unreadCount: 2,
      lastMessage: "Doctor, my chest tightness has increased significantly after taking the evening dose.",
      timestamp: "10:42 AM",
      online: true,
      pinned: true,
      archived: false,
      allergies: ["Penicillin", "Sulfa drugs"],
      medications: ["Salbutamol Inhaler", "Lisinopril 10mg"],
      diagnosis: "Mild Bronchospasm & Hypertension",
      upcomingAppointment: "Sep 18, 2026 - 10:00 AM",
      messages: [
        { id: "m1", sender: "patient", text: "Hello Doctor, I need advice on my blood pressure readings today.", timestamp: "09:15 AM", status: "read" },
        { id: "m2", sender: "doctor", text: "Good morning Sarah. Please share the readings you recorded this morning.", timestamp: "09:20 AM", status: "read" },
        {
          id: "m3",
          sender: "patient",
          text: "Here is my lab test result attached from Nairobi Central Labs.",
          timestamp: "10:10 AM",
          status: "read",
          attachment: { type: "lab", name: "Lipid_Profile_Results_Sep2026.pdf", meta: "2.4 MB • Verified Lab Report" }
        },
        { id: "m4", sender: "patient", text: "Doctor, my chest tightness has increased significantly after taking the evening dose.", timestamp: "10:42 AM", status: "delivered" }
      ]
    },
    {
      id: "conv-2",
      patientName: "Brian Kip Korir",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
      age: 45,
      gender: "Male",
      group: "Today",
      priority: "High",
      unreadCount: 0,
      lastMessage: "Thank you for the prescription renewal. I have collected the meds.",
      timestamp: "08:30 AM",
      online: false,
      pinned: false,
      archived: false,
      allergies: ["None known"],
      medications: ["Metformin 500mg"],
      diagnosis: "Type 2 Diabetes Mellitus",
      upcomingAppointment: "Sep 22, 2026 - 02:00 PM",
      messages: [
        { id: "bm1", sender: "patient", text: "Good morning Doc, can you refill my Metformin prescription?", timestamp: "08:00 AM", status: "read" },
        {
          id: "bm2",
          sender: "doctor",
          text: "Hello Brian, I have issued an electronic prescription refill valid at all accredited pharmacies.",
          timestamp: "08:25 AM",
          status: "read",
          attachment: { type: "prescription", name: "Rx_Metformin_500mg_SwiftMD.pdf", meta: "Digital Signature Verified" }
        },
        { id: "bm3", sender: "patient", text: "Thank you for the prescription renewal. I have collected the meds.", timestamp: "08:30 AM", status: "read" }
      ]
    },
    {
      id: "conv-3",
      patientName: "Amina Juma",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200",
      age: 28,
      gender: "Female",
      group: "Yesterday",
      priority: "Normal",
      unreadCount: 0,
      lastMessage: "The headache has subsided after following your hydration advice.",
      timestamp: "Yesterday",
      online: true,
      pinned: false,
      archived: false,
      allergies: ["Aspirin"],
      medications: ["Paracetamol as needed"],
      diagnosis: "Tension Headache",
      upcomingAppointment: "None scheduled",
      messages: [
        { id: "am1", sender: "patient", text: "The headache has subsided after following your hydration advice.", timestamp: "Yesterday", status: "read" }
      ]
    }
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChatId, conversations]);

  const activeChat = conversations.find((c) => c.id === selectedChatId) || conversations[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    setSending(true);
    setTimeout(() => {
      const newMessage: Message = {
        id: `m-${Date.now()}`,
        sender: "doctor",
        text: messageInput,
        timestamp: "Just now",
        status: "sent"
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedChatId
            ? { ...c, lastMessage: messageInput, timestamp: "Just now", messages: [...c.messages, newMessage] }
            : c
        )
      );

      setMessageInput("");
      setSending(false);
    }, 400);
  };

  const handleQuickReply = (text: string) => {
    setMessageInput(text);
  };

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch = c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || c.diagnosis.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterTab === "unread") return c.unreadCount > 0;
    if (filterTab === "priority") return c.priority === "Emergency" || c.priority === "High";
    if (filterTab === "archived") return c.archived;
    return !c.archived;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500">Loading HIPAA-Secure Swift MD Inbox...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      
      {/* ================= STICKY HEADER ================= */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 md:px-6 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-900 tracking-tight">Patient Messages</h1>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold rounded-full flex items-center gap-1">
                <ShieldCheck size={11} /> HIPAA Secure Inbox
              </span>
            </div>
            <p className="text-[11px] font-semibold text-slate-400">
              End-to-end encrypted clinical communication • {conversations.reduce((acc, c) => acc + c.unreadCount, 0)} unread messages
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64 hidden sm:block">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>
        </div>
      </header>

      {/* ================= MAIN TWO-COLUMN LAYOUT (30% / 70%) ================= */}
      <div className="flex-1 flex overflow-hidden max-w-[1600px] w-full mx-auto p-4 md:p-6 gap-6">
        
        {/* LEFT COLUMN: CONVERSATIONS LIST (30%) */}
        <aside className="w-full md:w-[32%] bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          
          {/* Filters & Tabs */}
          <div className="p-4 border-b border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider">Inbox Conversations</span>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {filteredConversations.length} active
              </span>
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {[
                { id: "all", label: "All" },
                { id: "unread", label: "Unread" },
                { id: "priority", label: "Priority" },
                { id: "archived", label: "Archived" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                    filterTab === tab.id
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                  <User size={24} />
                </div>
                <h4 className="text-xs font-bold text-slate-700">No conversations found</h4>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === selectedChatId;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedChatId(conv.id)}
                    className={`p-4 transition cursor-pointer flex items-start gap-3.5 relative ${
                      isSelected ? "bg-blue-50/70 border-l-4 border-blue-600" : "hover:bg-slate-50/80"
                    }`}
                  >
                    <div className="relative">
                      <img src={conv.avatar} alt={conv.patientName} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                      {conv.online && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-slate-900 truncate">{conv.patientName}</h4>
                        <span className="text-[10px] text-slate-400 font-medium">{conv.timestamp}</span>
                      </div>

                      <p className="text-xs text-slate-500 truncate">{conv.lastMessage}</p>

                      <div className="flex items-center gap-2 pt-1">
                        {conv.priority === "Emergency" && (
                          <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[9px] font-extrabold rounded-full border border-red-200 flex items-center gap-1">
                            <Flame size={10} /> Emergency
                          </span>
                        )}
                        {conv.priority === "High" && (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-extrabold rounded-full border border-amber-200">
                            High Priority
                          </span>
                        )}
                        {conv.unreadCount > 0 && (
                          <span className="ml-auto px-1.5 py-0.2 bg-blue-600 text-white text-[10px] font-black rounded-full">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* RIGHT COLUMN: ACTIVE CHAT & PATIENT INFO PANEL (70%) */}
        <main className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-xs flex overflow-hidden">
          
          {/* Active Chat Area */}
          <div className="flex-1 flex flex-col min-w-0 border-r border-slate-200">
            
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img src={activeChat.avatar} alt={activeChat.patientName} className="w-10 h-10 rounded-full object-cover" />
                  {activeChat.online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />}
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900">{activeChat.patientName}</h3>
                  <p className="text-[10px] text-slate-400">{activeChat.gender}, {activeChat.age} yrs • {activeChat.diagnosis}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => alert(`Starting audio call with ${activeChat.patientName}...`)} className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer" title="Audio Call">
                  <Phone size={15} />
                </button>
                <button onClick={() => alert(`Starting video consultation with ${activeChat.patientName}...`)} className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow transition cursor-pointer" title="Video Consultation">
                  <Video size={15} />
                </button>
                <button onClick={() => setShowPatientInfoPanel(!showPatientInfoPanel)} className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer" title="Toggle Patient Info">
                  <Info size={15} />
                </button>
              </div>
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
              <div className="text-center my-2">
                <span className="px-3 py-1 bg-slate-200/70 text-slate-600 text-[10px] font-bold rounded-full">
                  Today, September 18, 2026
                </span>
              </div>

              {activeChat.messages.map((msg) => {
                const isDoctor = msg.sender === "doctor";
                return (
                  <div key={msg.id} className={`flex ${isDoctor ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] md:max-w-[70%] rounded-2xl p-4 space-y-2 shadow-xs ${
                      isDoctor ? "bg-blue-600 text-white rounded-br-none" : "bg-white text-slate-900 border border-slate-200 rounded-bl-none"
                    }`}>
                      <p className="text-xs leading-relaxed">{msg.text}</p>

                      {/* Attachments inside chat */}
                      {msg.attachment && (
                        <div className={`p-3 rounded-xl border flex items-center gap-3 ${
                          isDoctor ? "bg-blue-700/60 border-blue-500 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                        }`}>
                          <div className="p-2 bg-white/10 rounded-lg">
                            {msg.attachment.type === "lab" ? <FileText size={20} /> : <Pill size={20} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-black truncate">{msg.attachment.name}</h5>
                            <p className="text-[10px] opacity-80">{msg.attachment.meta}</p>
                          </div>
                          <button onClick={() => alert("Downloading attachment...")} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition cursor-pointer">
                            <Download size={14} />
                          </button>
                        </div>
                      )}

                      <div className={`flex items-center justify-end gap-1.5 text-[9px] ${isDoctor ? "text-blue-100" : "text-slate-400"}`}>
                        <span>{msg.timestamp}</span>
                        {isDoctor && <CheckCheck size={12} />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Reply Suggestions */}
            <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Quick Replies:</span>
              {[
                "Please take your prescribed medication and rest.",
                "Your lab test results are normal and verified.",
                "Let's schedule an emergency video consultation.",
                "Please visit the clinic immediately for vitals check."
              ].map((reply, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickReply(reply)}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium rounded-xl whitespace-nowrap transition cursor-pointer"
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* Message Composer */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <button type="button" onClick={() => alert("Attach lab report or file...")} className="p-2.5 text-slate-400 hover:text-blue-600 transition cursor-pointer">
                <Paperclip size={18} />
              </button>
              <button type="button" onClick={() => alert("Insert prescription card...")} className="p-2.5 text-slate-400 hover:text-blue-600 transition cursor-pointer" title="Send Prescription">
                <Pill size={18} />
              </button>

              <input
                type="text"
                placeholder="Type secure medical message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />

              <button
                type="submit"
                disabled={sending || !messageInput.trim()}
                className={`p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow transition cursor-pointer ${
                  sending || !messageInput.trim() ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Send size={16} />
              </button>
            </form>
          </div>

          {/* PATIENT INFORMATION COLLAPSIBLE SIDE PANEL */}
          {showPatientInfoPanel && (
            <aside className="w-80 bg-slate-50/50 p-5 border-l border-slate-200 flex flex-col justify-between overflow-y-auto hidden xl:flex">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Patient Summary</h4>
                  <button onClick={() => setShowPatientInfoPanel(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={15} />
                  </button>
                </div>

                <div className="text-center space-y-2">
                  <img src={activeChat.avatar} alt={activeChat.patientName} className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-white shadow-md" />
                  <h3 className="text-sm font-black text-slate-900">{activeChat.patientName}</h3>
                  <p className="text-xs text-slate-500">{activeChat.gender}, {activeChat.age} years old</p>
                </div>

                <div className="space-y-4">
                  <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                    <span className="text-[10px] font-extrabold text-red-600 uppercase tracking-wider">Allergies</span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeChat.allergies.map((allergy, idx) => (
                        <span key={idx} className="px-2.5 py-0.5 bg-red-50 text-red-700 text-[10px] font-bold rounded-lg border border-red-200">
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                    <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">Current Medications</span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeChat.medications.map((med, idx) => (
                        <span key={idx} className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-lg border border-blue-200">
                          {med}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Upcoming Appointment</span>
                    <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Calendar size={13} className="text-blue-600" /> {activeChat.upcomingAppointment}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => alert(`Opening full medical record for ${activeChat.patientName}...`)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-blue-600 text-white font-black text-xs rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Open Full Medical Record</span>
                  <ExternalLink size={13} />
                </button>
              </div>
            </aside>
          )}
        </main>

      </div>
    </div>
  );
}