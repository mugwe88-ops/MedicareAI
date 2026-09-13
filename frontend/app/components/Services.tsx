"use client";

import { Video, Pill, Microscope, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Services() {
  const services = [
    {
      title: "Instant Video Consult",
      desc: "Connect with a licensed GP or specialist in under 2 minutes.",
      icon: Video,
      gradient: "from-blue-500 to-indigo-600",
      cta: "Consult Now",
      href: "/telehealth/instant",
    },
    {
      title: "Prescriptions & Medicines",
      desc: "Order prescribed medications with fast home delivery.",
      icon: Pill,
      gradient: "from-rose-500 to-pink-600",
      cta: "Order Now",
      href: "/pharmacy",
    },
    {
      title: "Lab Tests at Home",
      desc: "Schedule certified phlebotomists for doorstep sample collection.",
      icon: Microscope,
      gradient: "from-purple-500 to-violet-600",
      cta: "Book Lab Test",
      href: "/labs",
    },
    {
      title: "In-Clinic Visits",
      desc: "Reserve direct appointments with partner facilities.",
      icon: Calendar,
      gradient: "from-emerald-500 to-teal-600",
      cta: "Schedule Visit",
      href: "/clinic-visit",
    },
  ];

  return (
    <section className="py-16 max-w-7xl mx-auto px-6">
      <div className="flex flex-col items-center mb-10 text-center">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Comprehensive Care Services
        </h2>
        <p className="text-sm text-slate-500 mt-2 max-w-lg">
          Access high-quality medical services on demand through our secure digital health platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <Link
              key={service.title}
              href={service.href}
              className="group bg-white rounded-3xl p-6 border border-slate-100 shadow-soft hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${service.gradient} text-white flex items-center justify-center mb-5 shadow-md group-hover:scale-110 transition-transform`}
                >
                  <Icon size={22} />
                </div>
                <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
                  {service.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-2">
                  {service.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-blue-600">
                <span>{service.cta}</span>
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}