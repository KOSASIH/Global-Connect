import React from "react";
import { Line } from "react-chartjs-2";

export default function AnalyticsCharts({ analytics }) {
  if (!analytics) return null;
  const adoptionData = {
    labels: analytics.trendDates,
    datasets: [
      {
        label: "Adoption Trend",
        data: analytics.adoptionTrend,
        borderColor: "blue",
        fill: false,
      },
    ],
  };
  return (
    <div>
      <h4>Adoption Over Time</h4>
      <Line data={adoptionData} />
    </div>
  );
}
