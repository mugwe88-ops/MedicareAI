export default function Navbar() {
  return (
    <nav className="bg-primary text-white px-6 py-3 flex justify-between items-center">
      <h1 className="text-xl font-bold">Swift MD</h1>

      <div className="flex gap-6 text-sm">
        <a className="hover:underline">Find Doctors</a>
        <a className="hover:underline">Video Consult</a>
        <a className="hover:underline">Medicines</a>
      </div>

      <button className="bg-white text-primary px-4 py-1 rounded font-semibold">
        Login
      </button>
    </nav>
  );
}
