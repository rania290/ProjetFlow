import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartComponentProps {
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  data: any;
  title: string;
  height?: number;
}

export const ChartComponent: React.FC<ChartComponentProps> = ({ type, data, height = 300 }) => {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 12,
            family: 'Arial, sans-serif'
          },
          color: '#5a6c7d'
        }
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 14,
          family: 'Arial, sans-serif'
        },
        bodyFont: {
          size: 12,
          family: 'Arial, sans-serif'
        },
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: type === 'bar' || type === 'line' ? {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11,
            family: 'Arial, sans-serif'
          },
          color: '#5a6c7d'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 11,
            family: 'Arial, sans-serif'
          },
          color: '#5a6c7d'
        }
      }
    } : undefined
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <Bar data={data} options={chartOptions} />;
      case 'line':
        return <Line data={data} options={chartOptions} />;
      case 'pie':
        return <Pie data={data} options={chartOptions} />;
      case 'doughnut':
        return <Doughnut data={data} options={chartOptions} />;
      default:
        return <Bar data={data} options={chartOptions} />;
    }
  };

  return (
    <div style={{ height: `${height}px` }}>
      {renderChart()}
    </div>
  );
};

export const useChartData = () => {
  // Données pour le rapport d'avancement
  const weeklyProgressData = {
    labels: ['Semaine 1', 'Semaine 2', 'Semaine 3', 'Semaine 4', 'Semaine 5'],
    datasets: [
      {
        label: 'Progression (%)',
        data: [45, 52, 58, 61, 65],
        backgroundColor: 'rgba(52, 152, 219, 0.8)',
        borderColor: 'rgba(52, 152, 219, 1)',
        borderWidth: 2,
        borderRadius: 6,
        barThickness: 40
      }
    ]
  };

  const monthlyProgressData = {
    labels: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai'],
    datasets: [
      {
        label: 'Progression (%)',
        data: [20, 35, 45, 58, 65],
        backgroundColor: 'rgba(39, 174, 96, 0.8)',
        borderColor: 'rgba(39, 174, 96, 1)',
        borderWidth: 2,
        borderRadius: 6,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(39, 174, 96, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }
    ]
  };

  // Données pour le rapport de charge
  const resourceHoursData = {
    labels: ['Alice Chen', 'Bob Martin', 'Claire Dubois', 'David Kim'],
    datasets: [
      {
        label: 'Heures/Semaine',
        data: [38, 35, 40, 30],
        backgroundColor: 'rgba(52, 152, 219, 0.8)',
        borderColor: 'rgba(52, 152, 219, 1)',
        borderWidth: 2,
        borderRadius: 6
      },
      {
        label: 'Heures/Mois',
        data: [152, 140, 160, 120],
        backgroundColor: 'rgba(155, 89, 182, 0.8)',
        borderColor: 'rgba(155, 89, 182, 1)',
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  };

  const efficiencyData = {
    labels: ['Alice Chen', 'Bob Martin', 'Claire Dubois', 'David Kim'],
    datasets: [
      {
        label: 'Efficacité (%)',
        data: [92, 88, 95, 85],
        backgroundColor: [
          'rgba(39, 174, 96, 0.8)',
          'rgba(243, 156, 18, 0.8)',
          'rgba(39, 174, 96, 0.8)',
          'rgba(231, 76, 60, 0.8)'
        ],
        borderColor: [
          'rgba(39, 174, 96, 1)',
          'rgba(243, 156, 18, 1)',
          'rgba(39, 174, 96, 1)',
          'rgba(231, 76, 60, 1)'
        ],
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  };

  // Données pour le rapport financier
  const budgetData = {
    labels: ['VAERDIA Website', 'Mobile App V2', 'API Integration'],
    datasets: [
      {
        label: 'Budget (€)',
        data: [25000, 30000, 15000],
        backgroundColor: 'rgba(52, 152, 219, 0.8)',
        borderColor: 'rgba(52, 152, 219, 1)',
        borderWidth: 2,
        borderRadius: 6
      },
      {
        label: 'Dépensé (€)',
        data: [16250, 8000, 12000],
        backgroundColor: 'rgba(231, 76, 60, 0.8)',
        borderColor: 'rgba(231, 76, 60, 1)',
        borderWidth: 2,
        borderRadius: 6
      },
      {
        label: 'Restant (€)',
        data: [8750, 22000, 3000],
        backgroundColor: 'rgba(39, 174, 96, 0.8)',
        borderColor: 'rgba(39, 174, 96, 1)',
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  };

  const monthlyBurnData = {
    labels: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai'],
    datasets: [
      {
        label: 'Dépenses Mensuelles (€)',
        data: [8000, 12000, 9500, 11000, 16250],
        backgroundColor: 'rgba(231, 76, 60, 0.8)',
        borderColor: 'rgba(231, 76, 60, 1)',
        borderWidth: 2,
        borderRadius: 6,
        fill: true,
        tension: 0.4
      }
    ]
  };

  const budgetUtilizationData = {
    labels: ['VAERDIA Website', 'Mobile App V2', 'API Integration'],
    datasets: [
      {
        data: [65, 27, 80],
        backgroundColor: [
          'rgba(243, 156, 18, 0.8)',
          'rgba(39, 174, 96, 0.8)',
          'rgba(231, 76, 60, 0.8)'
        ],
        borderColor: [
          'rgba(243, 156, 18, 1)',
          'rgba(39, 174, 96, 1)',
          'rgba(231, 76, 60, 1)'
        ],
        borderWidth: 2
      }
    ]
  };

  // Données pour le rapport RH
  const absencesData = {
    labels: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai'],
    datasets: [
      {
        label: 'Jours d\'absence',
        data: [2, 3, 1, 4, 2],
        backgroundColor: 'rgba(231, 76, 60, 0.8)',
        borderColor: 'rgba(231, 76, 60, 1)',
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  };

  const productivityData = {
    labels: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai'],
    datasets: [
      {
        label: 'Productivité (%)',
        data: [85, 88, 92, 90, 95],
        backgroundColor: 'rgba(39, 174, 96, 0.2)',
        borderColor: 'rgba(39, 174, 96, 1)',
        borderWidth: 3,
        borderRadius: 6,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(39, 174, 96, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }
    ]
  };

  const teamDistributionData = {
    labels: ['Développement', 'Design', 'Management', 'Support'],
    datasets: [
      {
        data: [45, 25, 20, 10],
        backgroundColor: [
          'rgba(52, 152, 219, 0.8)',
          'rgba(155, 89, 182, 0.8)',
          'rgba(39, 174, 96, 0.8)',
          'rgba(243, 156, 18, 0.8)'
        ],
        borderColor: [
          'rgba(52, 152, 219, 1)',
          'rgba(155, 89, 182, 1)',
          'rgba(39, 174, 96, 1)',
          'rgba(243, 156, 18, 1)'
        ],
        borderWidth: 2
      }
    ]
  };

  return {
    weeklyProgressData,
    monthlyProgressData,
    resourceHoursData,
    efficiencyData,
    budgetData,
    monthlyBurnData,
    budgetUtilizationData,
    absencesData,
    productivityData,
    teamDistributionData
  };
};
