import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-primary text-white px-6 py-3 flex justify-between items-center">
      <Link href="/">
        <h1 className="text-xl font-bold cursor-pointer">Swift MD</h1>
      </Link>

      <div className="flex gap-6 text-sm">
        <Link href="/doctors" className="hover:underline">Find Doctors</Link>
        <Link href="/video-consult" className="hover:underline">Video Consult</Link>
        <Link href="/medicines" className="hover:underline">Medicines</Link>
      </div>

      <Link href="/login">
        <button className="bg-white text-primary px-6 py-1 rounded font-semibold hover:bg-gray-100 transition-colors">
          Login
        </button>
      </Link>
    </nav>
  );
}