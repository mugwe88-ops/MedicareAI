import DashboardCards from "../components/DashboardCards";
import PatientsTable from "../components/PatientsTable";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Swift MD Dashboard</h1>
      <DashboardCards />
      <PatientsTable />
    </div>
  );
}
