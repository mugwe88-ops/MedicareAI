"use client";

import { Search, Filter, ArrowUpDown } from "lucide-react";

interface FilterAndSearchBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedDoctor: string;
  setSelectedDoctor: (doc: string) => void;
  doctorsList: string[];
  sortOrder: "newest" | "oldest";
  setSortOrder: (order: "newest" | "oldest") => void;
}

export default function FilterAndSearchBar({
  searchQuery,
  setSearchQuery,
  selectedDoctor,
  setSelectedDoctor,
  doctorsList,
  sortOrder,
  setSortOrder,
}: FilterAndSearchBarProps) {
  return (
    <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
      <div className="relative flex-1 w-full">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search records, diagnosis, medications..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
        />
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto">
        <div className="relative flex-1 md:w-48">
          <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="w-full pl-8 pr-6 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer appearance-none"
          >
            <option value="all">All Doctors</option>
            {doctorsList.map((doc) => (
              <option key={doc} value={doc}>
                {doc}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition cursor-pointer shrink-0"
        >
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
          <span>{sortOrder === "newest" ? "Newest First" : "Oldest First"}</span>
        </button>
      </div>
    </div>
  );
}