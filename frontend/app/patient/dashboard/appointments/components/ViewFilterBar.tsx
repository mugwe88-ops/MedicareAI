"use client";

import { Search } from "lucide-react";

interface ViewFilterBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  activeView: "list" | "week" | "month";
  setActiveView: (view: "list" | "week" | "month") => void;
}

export default function ViewFilterBar({
  searchQuery,
  setSearchQuery,
  activeFilter,
  setActiveFilter,
  activeView,
  setActiveView,
}: ViewFilterBarProps) {
  const filters = ["All", "Upcoming", "Completed", "Cancelled", "Telehealth", "In-Person"];
  const views: Array<"list" | "week" | "month"> = ["list", "week", "month"];

  return (
    <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      <div className="relative flex-1">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search doctor name, specialty, reason..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
        />
      </div>

      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl overflow-x-auto max-w-full">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-2 text-xs font-extrabold rounded-xl transition cursor-pointer whitespace-nowrap ${
              activeFilter === filter
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="flex items-center bg-slate-100 p-1 rounded-2xl self-end md:self-auto">
        {views.map((view) => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className={`px-3.5 py-2 text-xs font-extrabold capitalize rounded-xl transition cursor-pointer ${
              activeView === view
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {view}
          </button>
        ))}
      </div>
    </div>
  );
}