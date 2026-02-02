import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AnalyticsDashboard = () => {
  const [data, setData] = useState({ perCategory: [], overall: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/analytics/summary");
        console.log("Analytics API Response:", res.data);
        setData(res.data);
        setLoading(false); // ✅ stop loading
      } catch (err) {
        console.error("Analytics fetch error:", err);
        setError("Failed to load analytics");
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Loading state
  if (loading) return <div className="p-8 text-xl">Loading analytics...</div>;

  // Error state
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  // Chart data
  const chartData = {
    labels: data.perCategory.map(item => item._id),
    datasets: [
      {
        label: "Total Listings",
        data: data.perCategory.map(item => item.totalListings),
        backgroundColor: "rgba(34, 197, 94, 0.7)",
      },
      {
        label: "Average Salary",
        data: data.perCategory.map(item => item.avgSalary || 0),
        backgroundColor: "rgba(59, 130, 246, 0.7)",
      }
    ]
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>

      {data.perCategory.length === 0 ? (
        <p>No analytics data available</p>
      ) : (
        <Bar
          data={chartData}
          options={{
            responsive: true,
            plugins: { legend: { position: "top" } },
          }}
        />
      )}

      <div className="mt-6">
        <p className="text-xl">
          Overall Listings: {data.overall.totalListings || 0}
        </p>
        <p className="text-xl">
          Overall Average Salary: {data.overall.averageSalary?.toFixed(2) || 0}
        </p>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
