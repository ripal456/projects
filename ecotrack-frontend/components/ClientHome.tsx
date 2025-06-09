/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUsers, getEnergyUsages } from "@/lib/api";
import { EnergyUsage, User } from "@/types";

export default function ClientHome() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [energyUsages, setEnergyUsages] = useState<EnergyUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchUsers = async () => {
      try {
        const response = await getUsers();

        setUsers(response || []);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError("Failed to fetch users");
      }
    };

    fetchUsers().finally(() => setLoading(false));
  }, [router]);

  const handleUserClick = async (user: User) => {
    setSelectedUser(user);
    try {
      const response = user.energy_usages;
      // Store data in localStorage before navigating
      localStorage.setItem("energyUsages", JSON.stringify(response));
      localStorage.setItem("userName", user.name);
      console.log(user.name);
      // Navigate to the usage summary page with userId
      router.push(`/usage-summary/${user.id}`);
      setEnergyUsages(response || []);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError("Failed to fetch energy usage for user");
    }
  };

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="container mx-auto p-4">
      {/* Users Grid */}
      <div className="mt-4">
        <h2 className="text-2xl font-bold mb-4">Users</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex flex-col items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-100"
              onClick={() => handleUserClick(user)}
            >
              {/* SVG Logo */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-12 h-12 mb-2"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
              </svg>
              <span className="text-center text-green-900 font-semibold">
                {user.name}
              </span>
              {user.role === "admin" ? (
                <span className="text-center">{user.role}</span>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* Energy Usage List
      {selectedUser && energyUsages.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">
            {selectedUser.name}&apos;s Energy Usage Summary
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
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
                      {new Date(usage.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedUser && energyUsages.length === 0 && (
        <p className="mt-4 text-center">
          No energy usage data available for {selectedUser.name}.
        </p>
      )} */}
    </div>
  );
}
