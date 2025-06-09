"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EnergyUsage } from "@/types";
import Navbar from "@/components/Navbar";
import EnergyChart from "@/components/EnergyChart";
import { format } from "date-fns";

export default function UsageSummary() {
  const [energyUsages, setEnergyUsages] = useState<EnergyUsage[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Retrieve data from localStorage
    try {
      const storedEnergyUsages = localStorage.getItem("energyUsages");
      const storedUserName = localStorage.getItem("userName");
      console.log(storedEnergyUsages, storedUserName);
      if (storedEnergyUsages && storedUserName) {
        setEnergyUsages(JSON.parse(storedEnergyUsages));
        setUserName(storedUserName);
      } else {
        setError("No energy usage data found.");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError("Failed to load energy usage data.");
    } finally {
      setLoading(false);
    }

    // // Clean up localStorage after loading to avoid stale data
    // return () => {
    //   localStorage.removeItem("energyUsages");
    //   localStorage.removeItem("userName");
    // };
  }, [router]);

  // Calculate summary statistics
  const totalKwh = energyUsages.reduce(
    (sum, usage) => sum + Number(usage.kwh_consumed),
    0
  );
  const recordCount = energyUsages.length;

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="container mx-auto p-4">
        <div className="bg-gray-100 p-2 text-center flex justify-between items-center">
          <button
            onClick={() => router.push("/")}
            className="text-blue-500 hover:underline"
          >
            Back to Users
          </button>
          <h2 className="text-lg font-semibold">
            {userName}&apos;s Energy Usage Summary
          </h2>
          <div></div> {/* Spacer for flex layout */}
        </div>

        {/* Summary Section */}
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Summary</h3>
          <div className="bg-white p-4 rounded shadow-md">
            <p className="text-lg">
              <span className="font-semibold">Total Energy Usage:</span>{" "}
              {totalKwh.toFixed(2)} kWh
            </p>
            <p className="text-lg">
              <span className="font-semibold">Number of Records:</span>{" "}
              {recordCount}
            </p>
          </div>
        </div>

        {/* Energy Usage Table */}
        {energyUsages.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">Usage Details</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border text-center">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border">Equipment</th>
                    <th className="py-2 px-4 border">Area</th>
                    <th className="py-2 px-4 border">Energy Usage (kWh)</th>
                    <th className="py-2 px-4 border">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {energyUsages.map((usage) => (
                    <tr key={usage.energyUsage_id}>
                      <td className="py-2 px-4 border">
                        {usage.device_type || "N/A"}
                      </td>
                      <td className="py-2 px-4 border">
                        {usage.location || "N/A"}
                      </td>
                      <td className="py-2 px-4 border">{usage.kwh_consumed}</td>
                      <td className="py-2 px-4 border">
                        {
                          format(new Date(usage.date), "dd-MMM-yyyy") // e.g., 12-Mar-2025
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Chart Section */}
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Energy Usage by Month</h3>
          {energyUsages.length > 0 ? (
            <EnergyChart data={energyUsages} />
          ) : (
            <p className="text-center">No energy usage data available.</p>
          )}
        </div>
      </main>
    </div>
  );
}
