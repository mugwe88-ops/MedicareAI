"use client";
import { Video, Pill, Microscope, Calendar, ClipboardList } from "lucide-react";

export default function Services() {
  const services = [
    {
      title: "Video Consultation",
      desc: "Connect with doctors within 5 minutes",
      icon: Video,
      color: "bg-orange-50",
      iconColor: "text-orange-500",
    },
    {
      title: "Order Medicines",
      desc: "Essentials delivered to your doorstep",
      icon: Pill,
      color: "bg-rose-50",
      iconColor: "text-rose-500",
    },
    {
      title: "Lab Tests",
      desc: "Sample pickup from your home",
      icon: Microscope,
      color: "bg-indigo-50",
      iconColor: "text-indigo-500",
    },
    {
      title: "Surgeries",
      desc: "Safe and trusted surgical care",
      icon: Calendar,
      color: "bg-emerald-50",
      iconColor: "text-emerald-500",
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4">
      {services.map((service) => {
        const Icon = service.icon;
        return (
          <div 
            key={service.title}
            className="group cursor-pointer bg-white border border-slate-100 rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-all active:scale-[0.98]"
          >
            {/* Minimalist Icon Box */}
            <div className={`w-14 h-14 shrink-0 rounded-lg flex items-center justify-center ${service.color}`}>
              <Icon size={24} className={service.iconColor} />
            </div>

            {/* Text Content */}
            <div className="flex flex-col">
              <h3 className="font-bold text-slate-800 text-[15px] group-hover:text-[#237BFF] transition-colors">
                {service.title}
              </h3>
              <p className="text-[12px] text-slate-500 leading-tight mt-0.5">
                {service.desc}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}