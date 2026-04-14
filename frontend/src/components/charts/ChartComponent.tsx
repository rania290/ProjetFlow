import React, { useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from 'chart.js';
import type { ChartData, ChartOptions } from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

interface ChartComponentProps {
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  data: any;
  title?: string;
  height?: number;
  gradientColors?: string[];
  showGrid?: boolean;
  animate?: boolean;
}

// PREMUIM COLOR THEME
export const THEME = {
    primary: {
        start: 'rgba(92, 124, 250, 0.8)',
        end: 'rgba(76, 110, 245, 0.2)',
        border: 'rgba(92, 124, 250, 1)'
    },
    emerald: {
        start: 'rgba(16, 185, 129, 0.8)',
        end: 'rgba(16, 185, 129, 0.1)',
        border: 'rgba(16, 185, 129, 1)'
    },
    amber: {
        start: 'rgba(245, 158, 11, 0.8)',
        end: 'rgba(245, 158, 11, 0.1)',
        border: 'rgba(245, 158, 11, 1)'
    },
    indigo: {
        start: 'rgba(99, 102, 241, 0.8)',
        end: 'rgba(99, 102, 241, 0.1)',
        border: 'rgba(99, 102, 241, 1)'
    },
    slate: {
        text: '#1e293b',
        muted: '#64748b',
        grid: 'rgba(226, 232, 240, 0.6)',
        bg: '#ffffff'
    }
};

export const ChartComponent: React.FC<ChartComponentProps> = ({ 
    type, 
    data, 
    height = 300, 
    gradientColors, 
    showGrid = true,
    animate = true
}) => {
  const chartRef = useRef<any>(null);

  // Helper to create a vertical gradient
  const createGradient = (ctx: CanvasRenderingContext2D, area: any, colors: string[]) => {
    const gradient = ctx.createLinearGradient(0, area.bottom, 0, area.top);
    colors.forEach((color, index) => {
        gradient.addColorStop(index / (colors.length - 1), color);
    });
    return gradient;
  };

  const processData = (canvasData: any) => {
    if (!chartRef.current) return canvasData;

    const chart = chartRef.current;
    const { ctx, chartArea } = chart;

    if (!chartArea) return canvasData;

    return {
      ...canvasData,
      datasets: canvasData.datasets.map((dataset: any, index: number) => {
        // Only apply gradients to bar/line datasets with multiple colors or specific requests
        if (type === 'bar' || type === 'line') {
          const colors = gradientColors || (index === 0 ? [THEME.primary.start, THEME.primary.end] : [THEME.indigo.start, THEME.indigo.end]);
          return {
            ...dataset,
            backgroundColor: createGradient(ctx, chartArea, colors),
            borderColor: dataset.borderColor || (index === 0 ? THEME.primary.border : THEME.indigo.border),
            borderWidth: type === 'line' ? 3 : 0,
            borderRadius: type === 'bar' ? 8 : 0,
            hoverBackgroundColor: dataset.borderColor,
            tension: 0.4,
            fill: type === 'line' ? true : false,
            pointRadius: type === 'line' ? 4 : 0,
            pointHoverRadius: 6,
            pointBackgroundColor: '#ffffff',
            pointBorderWidth: 2,
          };
        }
        return dataset;
      })
    };
  };

  const chartOptions: ChartOptions<any> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: animate ? {
        duration: 1500,
        easing: 'easeOutQuart'
    } : false,
    plugins: {
      legend: {
        display: type !== 'doughnut' && type !== 'pie',
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 11,
            family: "'Inter', sans-serif",
            weight: 600
          },
          color: THEME.slate.muted
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleFont: {
          size: 13,
          family: "'Space Grotesk', sans-serif",
          weight: 700
        },
        bodyFont: {
          size: 12,
          family: "'Inter', sans-serif"
        },
        padding: 12,
        cornerRadius: 12,
        boxPadding: 6,
        usePointStyle: true,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        backdropFilter: 'blur(4px)'
      }
    },
    cutout: type === 'doughnut' ? '70%' : undefined,
    radius: type === 'doughnut' ? '90%' : undefined,
    scales: (type === 'bar' || type === 'line') ? {
      x: {
        grid: {
          display: false
        },
        border: {
            display: false
        },
        ticks: {
          font: {
            size: 10,
            family: "'Inter', sans-serif",
            weight: 500
          },
          color: THEME.slate.muted
        }
      },
      y: {
        beginAtZero: true,
        max: data.datasets?.[0]?.label?.includes('(%)') ? 100 : undefined,
        grid: {
          display: showGrid,
          color: THEME.slate.grid,
          lineWidth: 1,
          drawTicks: false
        },
        border: {
            display: false,
            dash: [4, 4]
        },
        ticks: {
          padding: 10,
          font: {
            size: 10,
            family: "'Inter', sans-serif",
            weight: 500
          },
          color: THEME.slate.muted
        }
      }
    } : undefined
  };

  // Add custom plugin for center text in doughnut
  const centerTextPlugin = {
    id: 'centerText',
    beforeDraw: (chart: any) => {
        if (type !== 'doughnut') return;
        const { ctx, width, height } = chart;
        ctx.restore();
        
        // Find total value from dataset
        const total = chart.data.datasets[0].data.reduce((acc: number, val: number) => acc + val, 0);
        
        const fontSize = (height / 250).toFixed(2);
        ctx.font = `black ${fontSize}em 'Space Grotesk', sans-serif`;
        ctx.textBaseline = 'middle';
        ctx.fillStyle = THEME.slate.text;
        
        const text = total.toString();
        const textX = Math.round((width - ctx.measureText(text).width) / 2);
        const textY = height / 2;
        ctx.fillText(text, textX, textY);
        
        ctx.textBaseline = 'middle';
        ctx.font = `600 0.8em 'Inter', sans-serif`;
        ctx.fillStyle = THEME.slate.muted;
        const subtext = "TOTAL";
        const subtextX = Math.round((width - ctx.measureText(subtext).width) / 2);
        const subtextY = height / 2 + 25;
        ctx.fillText(subtext, subtextX, subtextY);
        
        ctx.save();
    }
  };

  const renderChart = () => {
    const commonProps = {
        options: chartOptions,
        ref: chartRef,
        data: chartRef.current ? processData(data) : data,
        plugins: type === 'doughnut' ? [centerTextPlugin] : []
    };

    switch (type) {
      case 'bar': return <Bar {...commonProps} />;
      case 'line': return <Line {...commonProps} />;
      case 'pie': return <Pie {...commonProps} />;
      case 'doughnut': return <Doughnut {...commonProps} />;
      default: return <Bar {...commonProps} />;
    }
  };

  // We need an effect to force a re-render once the ref is populated so gradients can be created
  const [isReady, setIsReady] = React.useState(false);
  useEffect(() => {
    if (chartRef.current) {
        setIsReady(true);
    }
  }, [chartRef.current]);

  return (
    <div style={{ height: `${height}px`, position: 'relative' }} className="chart-container-premium">
      {renderChart()}
    </div>
  );
};

export const useChartData = () => {
  // Données pour le rapport d'avancement
  const weeklyProgressData = {
    labels: ['Sem. 1', 'Sem. 2', 'Sem. 3', 'Sem. 4', 'Sem. 5', 'Sem. 6', 'Sem. 7', 'Sem. 8', 'Sem. 9', 'Sem. 10'],
    datasets: [
      {
        label: 'Progression (%)',
        data: [45, 52, 58, 61, 65, 70, 75, 82, 88, 92],
        backgroundColor: 'rgba(52, 152, 219, 0.8)',
        borderColor: 'rgba(52, 152, 219, 1)',
        borderWidth: 2,
        borderRadius: 6,
        barThickness: 20
      }
    ]
  };

  const monthlyProgressData = {
    labels: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
    datasets: [
      {
        label: 'Progression (%)',
        data: [20, 35, 45, 58, 65, 72, 78, 82, 85, 90, 93, 98],
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
    labels: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
    datasets: [
      {
        label: 'Dépenses Mensuelles (€)',
        data: [8000, 12000, 9500, 11000, 16250, 14000, 13000, 15500, 16000, 18000, 17500, 19000],
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
    labels: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
    datasets: [
      {
        label: 'Jours d\'absence',
        data: [2, 3, 1, 4, 2, 5, 8, 10, 3, 2, 4, 6],
        backgroundColor: 'rgba(231, 76, 60, 0.8)',
        borderColor: 'rgba(231, 76, 60, 1)',
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  };

  const productivityData = {
    labels: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
    datasets: [
      {
        label: 'Productivité (%)',
        data: [85, 88, 92, 90, 95, 93, 85, 80, 92, 94, 96, 98],
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
