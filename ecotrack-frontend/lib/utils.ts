import { EnergyUsage } from "@/types";

export const groupByMonth = (data: EnergyUsage[]) => {
  const monthlyData: { [key: string]: number } = {};

  // Log the raw data to verify
  // console.log("Raw EnergyUsage Data:", data);

  data.forEach((usage) => {
    const { date, kwh_consumed } = usage;

    // Parse the date and format as "Month Year"
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      console.warn(`Invalid date encountered: ${date}`);
      return; // Skip invalid dates
    }

    const monthYear = dateObj.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    // Ensure kwh_consumed is a number before summing
    const consumed =
      typeof kwh_consumed === "number"
        ? kwh_consumed
        : // eslint-disable-next-line @typescript-eslint/no-explicit-any
          parseFloat(kwh_consumed as any);
    if (isNaN(consumed)) {
      console.warn(`Invalid kwh_consumed value encountered: ${kwh_consumed}`);
      return;
    }

    // Sum kwh_consumed for each month
    monthlyData[monthYear] = (monthlyData[monthYear] || 0) + consumed;
  });

  // Log the grouped data
  // console.log("Grouped Monthly Data:", monthlyData);

  return monthlyData;
};

export const prepareChartData = (monthlyData: { [key: string]: number }) => {
  // Sort months chronologically
  const sortedLabels = Object.keys(monthlyData).sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateA.getTime() - dateB.getTime();
  });

  return {
    labels: sortedLabels,
    datasets: [
      {
        label: "kWh Consumed",
        data: sortedLabels.map((label) => monthlyData[label]),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };
};
