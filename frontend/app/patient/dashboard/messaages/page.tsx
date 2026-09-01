"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Conversation {
  doctor_id: number;
  doctor_name: string;
  doctor_specialization?: string;
}

interface Message {
  id: number | string;
  sender_id: number;
  receiver_id: number;
  message_text: string;
  created_at: string;
}

export default function PatientMessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeDoctor, setActiveDoctor] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState<string>("");
  
  const [loadingConversations, setLoadingConversations] = useState<boolean>(true);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch conversations list on mount
  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("jwt");
    if (!token) {
      setErrorMsg("No active session found. Please log in.");
      setTimeout(() => router.push("/login"), 1500);
      return;
    }

    setLoadingConversations(true);
    fetch(`${API_BASE}/api/messages/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to fetch conversations");
        }
        return res.json();
      })
      .then((data) => {
        const convList = Array.isArray(data) ? data : data.conversations || [];
        setConversations(convList);
        if (convList.length > 0) {
          setActiveDoctor(convList[0]);
        }
        setLoadingConversations(false);
      })
      .catch((err) => {
        console.error("Conversations Error:", err);
        setErrorMsg(err.message);
        setLoadingConversations(false);
      });
  }, [router, API_BASE]);

  // Fetch messages when active doctor changes
  useEffect(() => {
    if (!activeDoctor) return;

    const token = localStorage.getItem("token") || localStorage.getItem("jwt");
    if (!token) return;

    setLoadingMessages(true);
    fetch(`${API_BASE}/api/messages/${activeDoctor.doctor_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load message history");
        return res.json();
      })
      .then((data) => {
        const msgList = Array.isArray(data) ? data : data.messages || [];
        setMessages(msgList);
        setLoadingMessages(false);
      })
      .catch((err) => {
        console.error("Messages Error:", err);
        setLoadingMessages(false);
      });
  }, [activeDoctor, API_BASE]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeDoctor) return;

    const token = localStorage.getItem("token") || localStorage.getItem("jwt");
    if (!token) return;

    setIsSending(true);
    try {
      const res = await fetch(`${API_BASE}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiver_id: activeDoctor.doctor_id,
          message_text: newMessageText.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send message");

      setMessages((prev) => [...prev, data.message || data]);
      setNewMessageText("");
    } catch (err: any) {
      setErrorMsg(err.message || "Could not send message.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 my-4">
      <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-3 h-[75vh]">
        
        {/* Left Sidebar: Doctors List */}
        <div className="border-r border-slate-800 flex flex-col bg-slate-950/50">
          <div className="p-4 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white">Doctor Chats</h2>
            <p className="text-xs text-blue-400 font-medium uppercase tracking-wide">Secure Consultations</p>
          </div>

          {errorMsg && (
            <div className="m-3 p-3 bg-red-950/80 border border-red-800 text-red-300 text-xs rounded-xl">
              ⚠️ {errorMsg}
            </div>
          )}

          <div className="overflow-y-auto flex-1 divide-y divide-slate-800/50">
            {loadingConversations ? (
              <p className="p-4 text-xs text-slate-400 animate-pulse">Loading doctors...</p>
            ) : conversations.length === 0 ? (
              <p className="p-4 text-xs text-slate-400">No doctor chats available yet. Book an appointment first.</p>
            ) : (
              conversations.map((conv) => {
                const isActive = activeDoctor?.doctor_id === conv.doctor_id;
                return (
                  <button
                    key={conv.doctor_id}
                    onClick={() => setActiveDoctor(conv)}
                    className={`w-full p-4 text-left transition flex flex-col gap-1 cursor-pointer ${
                      isActive ? "bg-blue-600/20 border-l-4 border-blue-500" : "hover:bg-slate-900"
                    }`}
                  >
                    <span className="font-semibold text-sm text-white">{conv.doctor_name}</span>
                    <span className="text-xs text-blue-400 font-medium">
                      {conv.doctor_specialization || "General Practitioner"}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Section: Active Chat Thread */}
        <div className="md:col-span-2 flex flex-col bg-slate-900">
          {activeDoctor ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/30">
                <div>
                  <h3 className="font-bold text-white text-base">{activeDoctor.doctor_name}</h3>
                  <p className="text-xs text-slate-400">{activeDoctor.doctor_specialization || "Medical Specialist"}</p>
                </div>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loadingMessages ? (
                  <p className="text-xs text-slate-400 animate-pulse text-center py-6">Loading message history...</p>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    No messages with this doctor yet. Send a message below to start your consultation.
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isPatientSender = Number(msg.sender_id) !== Number(activeDoctor.doctor_id);
                    return (
                      <div
                        key={msg.id || index}
                        className={`flex flex-col ${isPatientSender ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-[75%] p-3.5 rounded-2xl text-sm ${
                            isPatientSender
                              ? "bg-blue-600 text-white rounded-br-sm shadow-md"
                              : "bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-sm"
                          }`}
                        >
                          <p>{msg.message_text}</p>
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 px-1">
                          {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-950/40 flex gap-2">
                <input
                  type="text"
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  placeholder="Type a message to your doctor..."
                  className="flex-1 p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  type="submit"
                  disabled={isSending || !newMessageText.trim()}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-bold rounded-xl transition shadow-lg cursor-pointer flex items-center justify-center"
                >
                  {isSending ? "Sending..." : "Send"}
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
              Select a doctor from the left sidebar to begin messaging.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}