import Sidebar from "@/app/components/Sidebar";

export default function DoctorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-slate-900/50 p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}
