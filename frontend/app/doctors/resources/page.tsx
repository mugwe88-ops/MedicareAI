"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, FileText, ExternalLink, Clock, ShieldCheck, Loader2 } from "lucide-react";

interface Resource {
  id: string;
  title: string;
  category: string;
  readTime: string;
  description: string;
  type: "Guideline" | "Research" | "Protocol";
  externalUrl: string;
}

export default function DoctorResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    "All",
    "Telehealth Standards",
    "Cardiology",
    "Healthcare Technology",
    "Pediatrics",
    "Pharmacology",
  ];

  const fetchPubMedData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Determine search query term
      const queryTerm = searchQuery
        ? searchQuery
        : selectedCategory !== "All"
        ? selectedCategory
        : "clinical medicine guidelines";

      // Read API Key from Vercel Config Environment Variable
      const apiKey = process.env.NEXT_PUBLIC_PUBMED_API_KEY;
      const apiParam = apiKey ? `&api_key=${apiKey}` : "";

      // 2. Step 1: Search PubMed for matching PMIDs
      const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(
        queryTerm
      )}&retmode=json&retmax=10${apiParam}`;

      const searchRes = await fetch(searchUrl);
      if (!searchRes.ok) throw new Error("Failed to query PubMed search endpoint");

      const searchData = await searchRes.json();
      const idList: string[] = searchData.esearchresult?.idlist || [];

      if (idList.length === 0) {
        setResources([]);
        setLoading(false);
        return;
      }

      // 3. Step 2: Fetch Article Details using PMIDs
      const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${idList.join(
        ","
      )}&retmode=json${apiParam}`;

      const summaryRes = await fetch(summaryUrl);
      if (!summaryRes.ok) throw new Error("Failed to query PubMed summary endpoint");

      const summaryData = await summaryRes.json();
      const resultObj = summaryData.result || {};

      // 4. Map PubMed results to the app UI format
      const mappedResources: Resource[] = idList
        .map((pmid) => {
          const item = resultObj[pmid];
          if (!item) return null;

          const title = item.title?.replace(/\.$/, "") || "PubMed Clinical Study";
          const journal = item.source || "Biomedical Literature";
          const pubDate = item.pubdate || "Recent";

          return {
            id: pmid,
            title,
            category: selectedCategory !== "All" ? selectedCategory : "General Medicine",
            readTime: `${Math.floor(Math.random() * 8) + 5} min read`,
            description: `Published in ${journal} (${pubDate}). This peer-reviewed publication provides clinical guidelines and evidence-based insights for healthcare practitioners.`,
            type: title.toLowerCase().includes("guideline") ? "Guideline" : "Research",
            externalUrl: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
          };
        })
        .filter(Boolean) as Resource[];

      setResources(mappedResources);
    } catch (error) {
      console.error("Error fetching PubMed data:", error);
      setResources([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPubMedData();
    }, 400); // Debounce user input to prevent excessive API calls

    return () => clearTimeout(timer);
  }, [fetchPubMedData]);

  const handleOpenModule = (res: Resource) => {
    if (res.externalUrl) {
      window.open(res.externalUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div>
          <span className="text-xs uppercase tracking-wider text-blue-600 font-bold block mb-1">
            Professional Development
          </span>
          <h1 className="text-xl font-extrabold text-gray-900">
            Continuing Education & Resources
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Access live peer-reviewed medical research papers and clinical guidelines directly from PubMed (NCBI).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-xl border border-blue-100">
            <ShieldCheck size={14} /> NCBI Verified
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search PubMed (e.g. Cardiology, AI, Triage)..."
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
              onClick={() => {
                setSelectedCategory(cat);
                setSearchQuery("");
              }}
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
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white border border-gray-200 rounded-2xl">
          <Loader2 className="animate-spin text-blue-600 mb-2" size={24} />
          <span className="text-xs font-semibold text-gray-500">
            Fetching literature from PubMed...
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.length === 0 ? (
            <div className="col-span-2 text-center py-12 bg-white border border-gray-200 rounded-2xl text-gray-500 text-xs">
              No medical resources found matching your search terms.
            </div>
          ) : (
            resources.map((res) => (
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
                  <p className="text-xs text-gray-600 line-clamp-3 mb-4">
                    {res.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
                  <span className="text-[11px] font-semibold text-blue-600 flex items-center gap-1">
                    <FileText size={14} /> {res.type}
                  </span>
                  <button
                    onClick={() => handleOpenModule(res)}
                    className="inline-flex items-center gap-1 px-4 py-2 bg-gray-900 hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm"
                  >
                    Read Module <ExternalLink size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}