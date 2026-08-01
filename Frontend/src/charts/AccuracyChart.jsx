import { useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

/**
 * labels: e.g. ['Mon','Tue',...] or ['Week 1','Week 2',...]
 * data: array of numbers (0-100 accuracy %)
 */
export default function AccuracyChart({ labels, data, height = 220 }) {
  const chartData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: 'Accuracy',
          data,
          borderColor: '#00D9C0',
          borderWidth: 2.5,
          pointBackgroundColor: '#00D9C0',
          pointBorderColor: '#0B1120',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.4,
          fill: true,
          backgroundColor: (ctx) => {
            const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, height)
            gradient.addColorStop(0, 'rgba(0, 217, 192, 0.35)')
            gradient.addColorStop(1, 'rgba(0, 217, 192, 0)')
            return gradient
          },
        },
      ],
    }),
    [labels, data, height]
  )

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#131B33',
        borderColor: 'rgba(255,255,255,0.14)',
        borderWidth: 1,
        titleColor: '#F5F3FF',
        bodyColor: '#C9C4E8',
        padding: 10,
        cornerRadius: 10,
        displayColors: false,
        callbacks: {
          label: (item) => `${item.parsed.y}% accuracy`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#A8A3C0', font: { size: 11 } },
        border: { color: 'rgba(255,255,255,0.1)' },
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(255,255,255,0.06)' },
        ticks: { color: '#A8A3C0', font: { size: 11 }, callback: (v) => `${v}%` },
        border: { display: false },
      },
    },
  }

  return (
    <div style={{ height }}>
      <Line data={chartData} options={options} />
    </div>
  )
}
