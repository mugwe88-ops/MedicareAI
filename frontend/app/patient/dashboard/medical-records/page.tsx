"use client";

import { useState, useEffect, useMemo } from "react";
import RecordsSummaryHeader from "./components/RecordsSummaryHeader";
import CategoryPillTabs, { CategoryType } from "./components/CategoryPillTabs";
import FilterAndSearchBar from "./components/FilterAndSearchBar";
import RecordCard, { MedicalRecordItem } from "./components/RecordCard";
import DocumentViewerModal from "./components/DocumentViewerModal";
import { ErrorState, EmptyState } from "./components/EmptyAndErrorState";
import LoadingSkeletons from "./components/LoadingSkeletons";
import QuickActionsBar from "./components/QuickActionsBar";

// Mock Fallback Data (reflecting Supabase structure)
const MOCK_RECORDS: MedicalRecordItem[] = [
  {
    id: "REC-9012",
    type: "prescription",
    title: "Amoxicillin & Analgesics",
    doctor_name: "Dr. Sarah Kimani",
    doctor_license: "A10492/KE",
    facility_name: "Equity Afya Juja",
    created_at: "2026-09-12T10:30:00Z",
    is_verified: true,
    diagnosis: "Upper Respiratory Tract Infection",
    details: "Take prescribed medication after meals. Complete full 7-day course.",
    medications: [
      { name: "Amoxicillin 500mg", dosage: "1 Capsule", frequency: "3 times daily x 7 days" },
      { name: "Paracetamol 500mg", dosage: "2 Tablets", frequency: "PRN for fever/pain" },
    ],
  },
  {
    id: "REC-8841",
    type: "lab_result",
    title: "Full Blood Count (FBC) & Lipid Panel",
    doctor_name: "Dr. Sarah Kimani",
    doctor_license: "A10492/KE",
    facility_name: "Juja Laboratory Complex",
    created_at: "2026-09-02T14:15:00Z",
    is_verified: true,
    diagnosis: "Hemoglobin: 14.2 g/dL (Normal) • Lipid levels within standard parameters.",
    details: "All parameters analyzed via automated cell counter. No acute flag detected.",
  },
  {
    id: "REC-7732",
    type: "clinical_note",
    title: "General Routine Physical Examination",
    doctor_name: "Dr. Michael Chen",
    doctor_license: "B88392/KE",
    facility_name: "Swift MD Virtual Clinic",
    created_at: "2026-08-15T09:00:00Z",
    is_verified: true,
    diagnosis: "Healthy adult male evaluation. Vitals stable.",
    details: "Patient reports high work stress. Advised lifestyle modifications and routine sleep hygiene.",
  },
  {
    id: "REC-6610",
    type: "vaccination",
    title: "Yellow Fever & Hepatitis B Booster",
    doctor_name: "Dr. Faith Njoroge",
    doctor_license: "C44210/KE",
    facility_name: "County Health Hub",
    created_at: "2026-06-20T11:00:00Z",
    is_verified: true,
    diagnosis: "Immunization complete. Valid international certificate issued.",
    details: "Batch No: YF-883912. No adverse post-vaccination reactions observed.",
  },
];

export default function MedicalRecordsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [records, setRecords] = useState<MedicalRecordItem[]>([]);

  // Filtering & Sorting State
  const [activeCategory, setActiveCategory] = useState<CategoryType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // Modal State
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecordItem | null>(null);

  const fetchRecords = async () => {
    setLoading(true);
    setError(false);
    try {
      // Simulate API / Supabase fetch delay
      await new Promise((res) => setTimeout(res, 800));
      setRecords(MOCK_RECORDS);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Summary Metrics
  const counts = useMemo(() => {
    return {
      total: records.length,
      prescriptions: records.filter((r) => r.type === "prescription").length,
      labResults: records.filter((r) => r.type === "lab_result").length,
      vaccines: records.filter((r) => r.type === "vaccination").length,
    };
  }, [records]);

  // Unique list of doctors for filter dropdown
  const doctorsList = useMemo(() => {
    const set = new Set(records.map((r) => r.doctor_name));
    return Array.from(set);
  }, [records]);

  // Filtered and sorted record list
  const filteredRecords = useMemo(() => {
    return records
      .filter((rec) => {
        // Category Filter
        if (activeCategory === "prescriptions" && rec.type !== "prescription") return false;
        if (activeCategory === "lab_results" && rec.type !== "lab_result") return false;
        if (activeCategory === "clinical_notes" && rec.type !== "clinical_note") return false;
        if (activeCategory === "vaccines" && rec.type !== "vaccination") return false;
        if (activeCategory === "sick_leave" && rec.type !== "sick_leave") return false;
        if (activeCategory === "allergies" && rec.type !== "allergy") return false;
        if (activeCategory === "vitals" && rec.type !== "vital") return false;

        // Doctor Filter
        if (selectedDoctor !== "all" && rec.doctor_name !== selectedDoctor) return false;

        // Search Query
        if (searchQuery.trim() !== "") {
          const q = searchQuery.toLowerCase();
          const matchTitle = rec.title.toLowerCase().includes(q);
          const matchDoc = rec.doctor_name.toLowerCase().includes(q);
          const matchDiag = rec.diagnosis?.toLowerCase().includes(q) || false;
          if (!matchTitle && !matchDoc && !matchDiag) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.created_at).getTime();
        const timeB = new Date(b.created_at).getTime();
        return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
      });
  }, [records, activeCategory, selectedDoctor, searchQuery, sortOrder]);

  const handleDownloadAll = () => {
    alert("Initiating bulk export for all verified medical records...");
  };

  const handleUploadExternal = () => {
    alert("Upload dialog opened. Supported formats: PDF, PNG, DICOM.");
  };

  const handleRequestCorrection = () => {
    alert("Opening correction request ticket...");
  };

  if (loading) {
    return <LoadingSkeletons />;
  }

  if (error) {
    return <ErrorState onRetry={fetchRecords} />;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Patient Health Summary */}
      <RecordsSummaryHeader counts={counts} onDownloadAll={handleDownloadAll} />

      {/* 2. Category Tabs */}
      <CategoryPillTabs activeCategory={activeCategory} onSelectCategory={setActiveCategory} />

      {/* 3. Search & Filter Bar */}
      <FilterAndSearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedDoctor={selectedDoctor}
        setSelectedDoctor={setSelectedDoctor}
        doctorsList={doctorsList}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />

      {/* 4. Record Cards or Empty State */}
      {filteredRecords.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecords.map((record) => (
            <RecordCard
              key={record.id}
              record={record}
              onView={(rec) => setSelectedRecord(rec)}
              onDownload={(rec) => alert(`Downloading PDF for ${rec.title}...`)}
              onShare={(rec) => alert(`Generating share link for ${rec.id}...`)}
            />
          ))}
        </div>
      )}

      {/* 5. Quick Actions Toolbar */}
      <QuickActionsBar
        onDownloadAll={handleDownloadAll}
        onUploadExternal={handleUploadExternal}
        onRequestCorrection={handleRequestCorrection}
        onShare={() => alert("Share dialog triggered.")}
      />

      {/* 6. Document Viewer Modal */}
      <DocumentViewerModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
    </div>
  );
}