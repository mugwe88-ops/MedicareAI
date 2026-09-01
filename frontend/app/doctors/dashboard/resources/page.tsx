"use client";

import { useState } from "react";
import { Search, BookOpen, FileText, ExternalLink, Clock, ShieldCheck, Download } from "lucide-react";

interface Resource {
  id: number;
  title: string;
  category: string;
  readTime: string;
  description: string;
  type: "Guideline" | "Research" | "Protocol";
  downloadUrl?: string;
}

const resourcesList: Resource[] = [
  {
    id: 1,
    title: "Telehealth Best Practices & Remote Patient Monitoring Guidelines",
    category: "Telehealth Standards",
    readTime: "8 min read",
    description: "Comprehensive standards for conducting secure, effective virtual consultations and handling diagnostic data remotely.",
    type: "Guideline",
  },
  {
    id: 2,
    title: "Managing Chronic Hypertension in Primary Care Settings",
    category: "Cardiology",
    readTime: "12 min read",
    description: "Updated clinical protocols for pharmacological intervention, lifestyle modifications, and patient blood pressure tracking.",
    type: "Protocol",
  },
  {
    id: 3,
    title: "AI-Assisted Diagnostics: Clinical Accuracy & Ethical Considerations",
    category: "Healthcare Technology",
    readTime: "15 min read",
    description: "An analytical review of utilizing diagnostic machine learning tools alongside human clinical judgment.",
    type: "Research",
  },
  {
    id: 4,
    title: "Pediatric Fever Management & Emergency Triage Protocol",
    category: "Pediatrics",
    readTime: "6 min read",
    description: "Quick-reference triage guidelines for evaluating acute febrile illnesses in infants and young children.",
    type: "Protocol",
  },
  {
    id: 5,
    title: "Pharmacology Update: Managing Drug Interactions in Polypharmacy",
    category: "Pharmacology",
    readTime: "10 min read",
    description: "Guidelines for reviewing complex patient medication lists to prevent adverse drug-drug interactions.",
    type: "Guideline",
  },
];

export default function DoctorResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Telehealth Standards", "Cardiology", "Healthcare Technology", "Pediatrics", "Pharmacology"];

  const filteredResources = resourcesList.filter((res) => {
    const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          res.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || res.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div>
          <span className="text-xs uppercase tracking-wider text-blue-600 font-bold block mb-1">Professional Development</span>
          <h1 className="text-xl font-extrabold text-gray-900">Continuing Education & Resources</h1>
          <p className="text-xs text-gray-500 mt-1">Access verified medical guidelines, clinical research modules, and practice protocols.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-xl border border-blue-100">
            <ShieldCheck size={14} /> Peer Reviewed
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search guidelines, protocols, research..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredResources.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-white border border-gray-200 rounded-2xl text-gray-500 text-xs">
            No resources match your search criteria.
          </div>
        ) : (
          filteredResources.map((res) => (
            <div
              key={res.id}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                    {res.category}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                    <Clock size={12} /> {res.readTime}
                  </span>
                </div>

                <h3 className="font-bold text-gray-900 text-sm mb-2 hover:text-blue-600 transition cursor-pointer">
                  {res.title}
                </h3>
                <p className="text-xs text-gray-600 line-clamp-2 mb-4">
                  {res.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
                <span className="text-[11px] font-semibold text-blue-600 flex items-center gap-1">
                  <FileText size={14} /> {res.type}
                </span>
                <button
                  onClick={() => alert(`Opening module: ${res.title}`)}
                  className="inline-flex items-center gap-1 px-4 py-2 bg-gray-900 hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm"
                >
                  Read Module <ExternalLink size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}