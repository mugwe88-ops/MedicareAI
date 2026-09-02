import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

// Common props wrapper
const defaultProps = (size: number, className: string) => ({
  width: size,
  height: size,
  viewBox: "0 0 64 64",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
  className: className || "w-12 h-12",
});

// --- HYPERTENSION (4 Icons) ---

export const BloodPressureCuff = ({ size = 64, className = "" }: IconProps) => (
  <svg {...defaultProps(size, className)}>
    <rect x="8" y="16" width="32" height="32" rx="6" fill="#0284c7" />
    <path d="M16 24h16M16 32h12" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
    <circle cx="48" cy="24" r="10" fill="#14bef0" stroke="#0284c7" strokeWidth="2" />
    <path d="M48 24l4-4" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
    <path d="M24 48v8a4 4 0 004 4h12" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export const StethoscopeHeart = ({ size = 64, className = "" }: IconProps) => (
  <svg {...defaultProps(size, className)}>
    <path d="M16 12v12a16 16 0 0032 0V12" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
    <path d="M32 40v8a8 8 0 008 8h4" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
    <circle cx="48" cy="56" r="5" fill="#14bef0" stroke="#0284c7" strokeWidth="2" />
    <path d="M32 18c-3-4-8-4-10 0-2 4 2 8 10 14 8-6 12-10 10-14-2-4-7-4-10 0z" fill="#f4237c" />
  </svg>
);

export const PulseLine = ({ size = 64, className = "" }: IconProps) => (
  <svg {...defaultProps(size, className)}>
    <rect x="4" y="12" width="56" height="40" rx="10" fill="#0f172a" />
    <path d="M10 32h10l4-12 8 24 6-16 4 4h12" stroke="#14bef0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ArterialVessel = ({ size = 64, className = "" }: IconProps) => (
  <svg {...defaultProps(size, className)}>
    <path d="M8 20c16 0 16 8 24 8s8-8 24-8" stroke="#0284c7" strokeWidth="6" strokeLinecap="round" />
    <path d="M8 44c16 0 16-8 24-8s8 8 24 8" stroke="#0284c7" strokeWidth="6" strokeLinecap="round" />
    <circle cx="28" cy="32" r="4" fill="#f4237c" />
    <circle cx="40" cy="30" r="3" fill="#14bef0" />
  </svg>
);

// --- DIABETES (4 Icons) ---

export const Glucometer = ({ size = 64, className = "" }: IconProps) => (
  <svg {...defaultProps(size, className)}>
    <rect x="16" y="8" width="32" height="48" rx="12" fill="#0284c7" />
    <rect x="22" y="16" width="20" height="14" rx="3" fill="#ffffff" />
    <text x="25" y="27" fill="#0f172a" fontSize="9" fontWeight="bold">105</text>
    <circle cx="32" cy="42" r="6" fill="#14bef0" />
  </svg>
);

export const BloodDropTest = ({ size = 64, className = "" }: IconProps) => (
  <svg {...defaultProps(size, className)}>
    <path d="M32 8c0 0-16 18-16 28a16 16 0 0032 0C48 26 32 8 32 8z" fill="#f4237c" />
    <path d="M26 32a6 6 0 006 6" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const InsulinPen = ({ size = 64, className = "" }: IconProps) => (
  <svg {...defaultProps(size, className)}>
    <path d="M12 52l32-32 8 8-32 32-8-8z" fill="#0284c7" />
    <path d="M44 20l4-4 4 4-4 4-4-4z" fill="#14bef0" />
    <path d="M12 52l-6 6" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
    <path d="M28 36l4 4" stroke="#ffffff" strokeWidth="2" />
  </svg>
);

export const HealthySyringe = ({ size = 64, className = "" }: IconProps) => (
  <svg {...defaultProps(size, className)}>
    <rect x="20" y="20" width="28" height="12" rx="2" transform="rotate(-45 20 20)" fill="#14bef0" stroke="#0284c7" strokeWidth="2" />
    <path d="M12 52l10-10M42 22l10-10" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" />
    <path d="M50 10l6-6" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// --- MALARIA (4 Icons) ---

export const MosquitoPrevention = ({ size = 64, className = "" }: IconProps) => (
  <svg {...defaultProps(size, className)}>
    <circle cx="32" cy="32" r="22" stroke="#0284c7" strokeWidth="4" fill="#ffffff" />
    <path d="M22 26l20 12M22 38l20-12" stroke="#0f172a" strokeWidth="2" />
    <circle cx="32" cy="32" r="6" fill="#f4237c" />
    <path d="M16 16l32 32" stroke="#f4237c" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

export const MicroscopeSlide = ({ size = 64, className = "" }: IconProps) => (
  <svg {...defaultProps(size, className)}>
    <path d="M20 52h24M32 52V36M24 20a8 8 0 0116 0v16H24V20z" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
    <rect x="16" y="32" width="32" height="4" rx="2" fill="#14bef0" />
    <circle cx="32" cy="52" r="6" fill="#0f172a" />
  </svg>
);

export const RedBloodCells = ({ size = 64, className = "" }: IconProps) => (
  <svg {...defaultProps(size, className)}>
    <circle cx="24" cy="24" r="14" fill="#0284c7" />
    <circle cx="24" cy="24" r="6" fill="#14bef0" />
    <circle cx="42" cy="38" r="12" fill="#0284c7" />
    <circle cx="42" cy="38" r="5" fill="#14bef0" />
  </svg>
);

export const ThermometerFever = ({ size = 64, className = "" }: IconProps) => (
  <svg {...defaultProps(size, className)}>
    <rect x="28" y="8" width="8" height="36" rx="4" fill="#ffffff" stroke="#0284c7" strokeWidth="3" />
    <circle cx="32" cy="48" r="10" fill="#f4237c" />
    <path d="M32 24v18" stroke="#f4237c" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

// --- MENTAL HEALTH (4 Icons) ---

export const BrainSpark = ({ size = 64, className = "" }: IconProps) => (
  <svg {...defaultProps(size, className)}>
    <path d="M32 12c-8 0-14 6-14 14 0 4 2 8 5 10-1 4 1 8 4 10 3 2 7 2 9 0 2 2 6 2 9 0 3-2 5-6 4-10 3-2 5-6 5-10 0-8-6-14-12-14z" fill="#14bef0" stroke="#0284c7" strokeWidth="2" />
    <path d="M32 20v18M26 26h12" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const MindBalance = ({ size = 64, className = "" }: IconProps) => (
  <svg {...defaultProps(size, className)}>
    <circle cx="32" cy="20" r="10" fill="#0284c7" />
    <path d="M16 48c0-8 7-14 16-14s16 6 16 14" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
    <path d="M32 8v4M20 14l3 3M44 14l-3 3" stroke="#14bef0" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const EmotionalCalm = ({ size = 64, className = "" }: IconProps) => (
  <svg {...defaultProps(size, className)}>
    <circle cx="32" cy="32" r="22" fill="#0284c7" />
    <path d="M22 26c2-2 6-2 8 0M34 26c2-2 6-2 8 0" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
    <path d="M24 38c4 4 12 4 16 0" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export const HeadTalkTherapy = ({ size = 64, className = "" }: IconProps) => (
  <svg {...defaultProps(size, className)}>
    <path d="M16 48V36a14 14 0 0128 0v12" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
    <rect x="34" y="12" width="22" height="16" rx="6" fill="#14bef0" />
    <path d="M40 28l-2 6 6-4" fill="#14bef0" />
  </svg>
);

// --- NUTRITION (4 Icons) ---

export const HealthyApple = ({ size = 64, className = "" }: IconProps) => (
  <svg {...defaultProps(size, className)}>
    <path d="M32 18c-6-6-16-2-16 10 0 12 10 22 16 26 6-4 16-14 16-26 0-12-10-16-16-10z" fill="#0284c7" />
    <path d="M32 18c2-4 6-6 10-6" stroke="#14bef0" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export const WaterHydration = ({ size = 64, className = "" }: IconProps) => (
  <svg {...defaultProps(size, className)}>
    <path d="M32 10c0 0-16 16-16 26a16 16 0 0032 0C48 26 32 10 32 10z" fill="#14bef0" stroke="#0284c7" strokeWidth="2" />
    <path d="M26 34a6 6 0 006 6" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export const BalancedPlate = ({ size = 64, className = "" }: IconProps) => (
  <svg {...defaultProps(size, className)}>
    <circle cx="32" cy="32" r="22" stroke="#0284c7" strokeWidth="4" fill="#ffffff" />
    <path d="M32 10v44M32 32h22" stroke="#14bef0" strokeWidth="3" strokeLinecap="round" />
    <circle cx="22" cy="22" r="4" fill="#0284c7" />
  </svg>
);

export const AvocadoFats = ({ size = 64, className = "" }: IconProps) => (
  <svg {...defaultProps(size, className)}>
    <path d="M32 10c-10 0-16 12-16 24a16 16 0 0032 0c0-12-6-24-16-24z" fill="#0284c7" />
    <path d="M32 18c-6 0-10 8-10 16a10 10 0 0020 0c0-8-4-16-10-16z" fill="#14bef0" />
    <circle cx="32" cy="38" r="5" fill="#0f172a" />
  </svg>
);

// --- TELEMEDICINE (4 Icons) ---

export const DoctorVideoCall = ({ size = 64, className = "" }: IconProps) => (
  <svg {...defaultProps(size, className)}>
    <rect x="8" y="12" width="48" height="32" rx="6" fill="#0f172a" />
    <path d="M24 52h16M32 44v8" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
    <circle cx="32" cy="24" r="6" fill="#14bef0" />
    <path d="M22 36c0-4 4-6 10-6s10 2 10 6" fill="#0284c7" />
  </svg>
);

export const MobilePrescription = ({ size = 64, className = "" }: IconProps) => (
  <svg {...defaultProps(size, className)}>
    <rect x="16" y="8" width="32" height="48" rx="8" fill="#0284c7" />
    <rect x="22" y="16" width="20" height="28" rx="2" fill="#ffffff" />
    <path d="M26 22h12M26 28h8M26 34h10" stroke="#14bef0" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const ChatMedicalSupport = ({ size = 64, className = "" }: IconProps) => (
  <svg {...defaultProps(size, className)}>
    <path d="M12 16h40a4 4 0 014 4v24a4 4 0 01-4 4H24l-8 6v-6h-4a4 4 0 01-4-4V20a4 4 0 014-4z" fill="#0284c7" />
    <path d="M32 24v12M26 30h12" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export const OnlineSchedule = ({ size = 64, className = "" }: IconProps) => (
  <svg {...defaultProps(size, className)}>
    <rect x="10" y="14" width="44" height="40" rx="6" fill="#ffffff" stroke="#0284c7" strokeWidth="3" />
    <path d="M10 24h44" stroke="#0284c7" strokeWidth="3" />
    <path d="M20 8v8M44 8v8" stroke="#14bef0" strokeWidth="4" strokeLinecap="round" />
    <circle cx="24" cy="34" r="3" fill="#0284c7" />
    <circle cx="34" cy="34" r="3" fill="#14bef0" />
    <circle cx="44" cy="34" r="3" fill="#0284c7" />
  </svg>
);