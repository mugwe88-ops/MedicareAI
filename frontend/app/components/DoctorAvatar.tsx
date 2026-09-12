"use client";

import { useState, useEffect } from "react";

interface DoctorAvatarProps {
  name?: string;
  size?: "sm" | "md" | "lg";
}

export default function DoctorAvatar({ name = "Doctor", size = "md" }: DoctorAvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  useEffect(() => {
    // Initial load from storage
    const storedAvatar = localStorage.getItem("doctor_avatar");
    if (storedAvatar) setAvatarUrl(storedAvatar);

    // Listen for updates from settings page
    const handleAvatarUpdate = () => {
      const updated = localStorage.getItem("doctor_avatar");
      if (updated) setAvatarUrl(updated);
    };

    window.addEventListener("doctorAvatarUpdated", handleAvatarUpdate);
    return () => window.removeEventListener("doctorAvatarUpdated", handleAvatarUpdate);
  }, []);

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-20 h-20 text-xl",
  };

  const getInitials = (str: string) =>
    str
      .replace(/^Dr\.\s+/i, "")
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "MD";

  return (
    <div className={`relative rounded-2xl overflow-hidden bg-blue-600 text-white font-black flex items-center justify-center shadow-sm ${sizeClasses[size]}`}>
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}