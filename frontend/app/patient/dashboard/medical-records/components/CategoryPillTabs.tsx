"use client";

import { LayoutGrid, Pill, FlaskConical, FileText, ShieldCheck, Stethoscope, AlertCircle, Activity } from "lucide-react";

export type CategoryType = "all" | "prescriptions" | "lab_results" | "clinical_notes" | "vaccines" | "sick_leave" | "allergies" | "vitals";

interface CategoryPillTabsProps {
  activeCategory: CategoryType;
  onSelectCategory: (cat: CategoryType) => void;
}

const CATEGORIES: { id: CategoryType; label: string; icon: React.ElementType }[] = [
  { id: "all", label: "All", icon: LayoutGrid },
  { id: "prescriptions", label: "Prescriptions", icon: Pill },
  { id: "lab_results", label: "Lab Results", icon: FlaskConical },
  { id: "clinical_notes", label: "Clinical Notes", icon: FileText },
  { id: "vaccines", label: "Vaccines", icon: ShieldCheck },
  { id: "sick_leave", label: "Sick Leave", icon: Stethoscope },
  { id: "allergies", label: "Allergies", icon: AlertCircle },
  { id: "vitals", label: "Vitals", icon: Activity },
];

export default function CategoryPillTabs({ activeCategory, onSelectCategory }: CategoryPillTabsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const isActive = activeCategory === cat.id;

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              isActive
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}