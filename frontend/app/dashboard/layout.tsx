import Sidebar from "../components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <main className="flex-1 w-full p-4 md:p-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}