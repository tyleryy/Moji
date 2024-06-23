import React, { useState } from "react";
import { Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const HorizontalBar: React.FC = () => {
  const [emojiData, setData] = useState([]);
  const data: ChartData<"bar"> = {
    labels: ["Emoji 1", "Emoji 2", "Emoji 3"],
    datasets: [
      {
        label: "Dataset 1",
        data: emojiData,
        backgroundColor: "rgba(75,192,192,1)",
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    indexAxis: "y",
    scales: {
      x: {
        beginAtZero: true,
      },
    },
    responsive: true,
    plugins: {
      legend: {
        position: "right",
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  return (
    <div>
      <Bar data={data} options={options} />
    </div>
  );
};

export default HorizontalBar;
