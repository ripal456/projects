/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation"; // Correct import
import { User, EnergyUsagePayload } from "@/types";
// Assuming getApiErrorMessage exists in your api lib
import { getUsers, addEnergyUsage, getApiErrorMessage } from "@/lib/api";
import Navbar from "@/components/Navbar"; // Assuming you have this
import Link from "next/link";

export default function AddEnergyUsagePage() {
  const router = useRouter();

  // --- State Variables ---
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [kwhConsumed, setKwhConsumed] = useState<string>("");
  // Initialize date as empty, set default in useEffect
  const [date, setDate] = useState<string>("");
  const [deviceType, setDeviceType] = useState<string>("");
  const [location, setLocation] = useState<string>("");

  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  // --- FIX: Uncomment error state ---
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // --- Effects ---

  // --- FIX: Set default date on client-side after mount ---
  useEffect(() => {
    // Set default date only on the client
    setDate(new Date().toISOString().split("T")[0]);
  }, []); // Empty array ensures this runs once after initial render

  // Combined effect for auth check and user fetching
  useEffect(() => {
    // Define the async function INSIDE useEffect
    const performInitialSetup = async () => {
      setIsLoadingUsers(true);
      setError(null); // Clear previous errors

      // 1. Auth Check (Client-side only)
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not authenticated. Redirecting to login...");
        setTimeout(() => router.push("/login"), 1500);
        setIsLoadingUsers(false); // Stop loading state
        return; // Prevent fetch attempt
      }

      // 2. Fetch Users (if authenticated)
      try {
        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers || []); // Handle potential null/undefined response
      } catch (err: any) {
        console.error("Error fetching users:", err);
        const message = getApiErrorMessage(err); // Use helper if available
        setError(`Error fetching users: ${message}`);
        setUsers([]); // Set users to empty array on error
        if (err.response?.status === 401) {
          setError(`Authentication error: ${message}. Redirecting to login...`);
          setTimeout(() => router.push("/login"), 2000);
        }
      } finally {
        setIsLoadingUsers(false);
      }
    };

    // Call the async function
    performInitialSetup();

    // Dependency array includes router because it's used
  }, [router]);

  // --- Event Handlers ---
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // --- FIX: Re-enable validation ---
    if (!selectedUserId || !kwhConsumed || !date) {
      setError("Please fill in User, KWH Consumed, and Date.");
      return;
    }
    const parsedUserId = parseInt(selectedUserId, 10);
    const parsedKwh = parseFloat(kwhConsumed);
    if (isNaN(parsedUserId) || isNaN(parsedKwh) || parsedKwh < 0) {
      setError(
        "Invalid User ID or KWH Consumed value (must be a non-negative number)."
      );
      return;
    }

    const payload: EnergyUsagePayload = {
      user_id: parsedUserId,
      kwh_consumed: parsedKwh,
      date: date,
      ...(deviceType.trim() && { device_type: deviceType.trim() }),
      ...(location.trim() && { location: location.trim() }),
    };

    setIsSubmitting(true);

    try {
      const newUsage = await addEnergyUsage(payload);
      // --- FIX: Use the correct ID from response if available ---
      // Assuming the response `newUsage` has an `id` field for the usage record itself
      // If you want the user_id, keep newUsage.user_id
      setSuccessMessage(
        `Energy usage added successfully! (ID: ${
          newUsage.id ?? newUsage.user_id
        })`
      );
      setSelectedUserId("");
      setKwhConsumed("");
      // Keep date as is, or reset: setDate(new Date().toISOString().split('T')[0]);
      setDeviceType("");
      setLocation("");
    } catch (err: any) {
      console.error("Error submitting energy usage:", err);
      const message = getApiErrorMessage(err); // Use helper
      setError(`Submission failed: ${message}`);
      if (err.response?.status === 401) {
        setError(`Authentication error: ${message}. Redirecting to login...`);
        setTimeout(() => router.push("/login"), 2000);
      } else if (err.response?.status === 403) {
        setError(
          `Permission Denied: You might not have the right role. (${message})`
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render Logic (JSX remains largely the same, ensure Navbar is imported/used if needed) ---
  return (
    // Optional: Add Navbar and page background
    // <div className="min-h-screen bg-gray-50">
    <>
      <Navbar />
      <div className="container mx-auto p-4 max-w-lg mt-6">
        {/* Added margin-top */}
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          {/* Adjusted text color */}
          Add New Energy Usage
        </h1>
        {/* Loading indicator for user fetch */}
        {isLoadingUsers && (
          <p className="text-center text-gray-500 my-4">Loading users...</p>
        )}
        {/* Wrap form in a card */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-white p-6 rounded-lg shadow-md"
        >
          {/* User Selection */}
          <div>
            <label
              htmlFor="user"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              User *
            </label>
            <select
              id="user" // Ensure IDs match htmlFor
              name="user_id"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              required
              disabled={
                isLoadingUsers ||
                isSubmitting ||
                (!isLoadingUsers && users.length === 0)
              }
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="" disabled>
                {isLoadingUsers
                  ? "Loading..."
                  : users.length === 0
                  ? "No users available"
                  : "-- Select a User --"}
              </option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} (ID: {user.id})
                </option>
              ))}
            </select>
            {/* --- FIX: Use the uncommented error state --- */}
            {!isLoadingUsers && users.length === 0 && !error && (
              <p className="text-sm text-gray-500 mt-1">
                No users found. Ensure you are logged in with appropriate
                permissions.
              </p>
            )}
          </div>

          {/* KWH Consumed */}
          <div>
            <label
              htmlFor="kwh"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              KWH Consumed *
            </label>
            <input
              type="number"
              id="kwh" // Ensure IDs match htmlFor
              name="kwh_consumed"
              value={kwhConsumed}
              onChange={(e) => setKwhConsumed(e.target.value)}
              required
              step="any"
              min="0"
              disabled={isSubmitting}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm disabled:bg-gray-100"
              placeholder="e.g., 15.75"
            />
          </div>

          {/* Date */}
          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Date *
            </label>
            <input
              type="date"
              id="date" // Ensure IDs match htmlFor
              name="date"
              value={date} // Value now comes from state, default set in useEffect
              onChange={(e) => setDate(e.target.value)}
              required
              disabled={isSubmitting}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm disabled:bg-gray-100"
            />
          </div>

          {/* Device Type (Optional) */}
          <div>
            <label
              htmlFor="device_type"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Device Type (Optional)
            </label>
            <input
              type="text"
              id="device_type" // Ensure IDs match htmlFor
              name="device_type"
              value={deviceType}
              onChange={(e) => setDeviceType(e.target.value)}
              disabled={isSubmitting}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm disabled:bg-gray-100"
              placeholder="e.g., Air Conditioner"
            />
          </div>

          {/* Location (Optional) */}
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Location (Optional)
            </label>
            <input
              type="text"
              id="location" // Ensure IDs match htmlFor
              name="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isSubmitting}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm disabled:bg-gray-100"
              placeholder="e.g., Living Room"
            />
          </div>

          {successMessage && (
            <div
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-4"
              role="alert"
            >
              {" "}
              {/* Adjusted margin */}
              <strong className="font-bold">Success: </strong>
              <span className="block sm:inline">{successMessage}</span>
            </div>
          )}

          {/* --- Submit Button --- */}
          <div className="pt-4 flex items-center justify-center gap-10">
            <button
              type="submit"
              disabled={
                isLoadingUsers ||
                isSubmitting ||
                (!isLoadingUsers && users.length === 0)
              }
              className=" flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-900 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Add Energy Usage"}
            </button>
            <Link href="/">Back</Link>
          </div>
        </form>
      </div>
    </>
  );
}
