"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData, // Import ChartData type for better type safety
} from "chart.js";
import { groupByMonth, prepareChartData } from "@/lib/utils";
import { EnergyUsage } from "@/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function EnergyChart({ data }: { data: EnergyUsage[] }) {
  const monthlyData = groupByMonth(data);
  // 1. Prepare the basic chart data structure
  const baseChartData = prepareChartData(monthlyData);

  // 2. Define your desired colors
  const barBackgroundColor = "rgba(6, 156, 86, 0.6)"; // Example: Blue with transparency
  const barBorderColor = "rgb(6, 174, 76)"; // Example: Solid Blue

  // 3. Create the final chart data object, adding/overriding colors
  //    We assume prepareChartData returns an object with a 'datasets' array
  const chartData: ChartData<"bar", number[], string> = {
    ...baseChartData, // Spread the labels and any other top-level props
    datasets: baseChartData.datasets.map((dataset) => ({
      ...dataset, // Keep existing dataset properties (like label, data)
      backgroundColor: barBackgroundColor, // Set the background color
      borderColor: barBorderColor, // Set the border color
      borderWidth: 1, // Optional: Set border width
      // If you want DIFFERENT colors for EACH bar within this dataset:
      // backgroundColor: [
      //   'rgba(255, 99, 132, 0.6)',
      //   'rgba(54, 162, 235, 0.6)',
      //   'rgba(255, 206, 86, 0.6)',
      //   'rgba(75, 192, 192, 0.6)',
      //   'rgba(153, 102, 255, 0.6)',
      //   'rgba(255, 159, 64, 0.6)',
      //   // Add more colors if you have more bars (months)
      // ],
      // borderColor: [ // Corresponding border colors
      //   'rgb(255, 99, 132)',
      //   'rgb(54, 162, 235)',
      //   'rgb(255, 206, 86)',
      //   'rgb(75, 192, 192)',
      //   'rgb(153, 102, 255)',
      //   'rgb(255, 159, 64)',
      // ],
    })),
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Energy Usage by Month" },
    },
    scales: {
      // Optional: Add scales for better control if needed
      y: {
        beginAtZero: true, // Often good practice for bar charts
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded shadow-md">
      {/* Pass the modified chartData with colors */}
      <Bar data={chartData} options={options} />
    </div>
  );
}
