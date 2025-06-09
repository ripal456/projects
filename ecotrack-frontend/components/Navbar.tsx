"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <nav className="bg-gray-100 border-bottom p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className=" text-2xl font-bold logo">EcoTrack</h1>
        <div className="flex items-center gap-8">
          <Link
            href="/AddEnergyUsage"
            className="text-green-700 font-semibold text-xl"
          >
            Add Energy usage
          </Link>

          <Link href="#" className="text-green-700 font-semibold text-xl">
            Profile
          </Link>
          <Link href="#" className="text-green-700 font-semibold text-xl">
            Register
          </Link>

          <button
            onClick={handleLogout}
            className="text-white bg-green-700 px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
