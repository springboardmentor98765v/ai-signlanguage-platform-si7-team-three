import { useMemo } from 'react'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js'

ChartJS.register(ArcElement, Tooltip)

const PALETTE = ['#00D9C0', '#FF6B4A', '#6C5CE7', '#FFB84C']

export default function DistributionChart({ labels, data, height = 200 }) {
  const chartData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          data,
          backgroundColor: PALETTE,
          borderColor: '#0B1120',
          borderWidth: 3,
          hoverOffset: 6,
        },
      ],
    }),
    [labels, data]
  )

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#C9C4E8', font: { size: 11 }, padding: 14, usePointStyle: true, pointStyle: 'circle' },
      },
      tooltip: {
        backgroundColor: '#131B33',
        borderColor: 'rgba(255,255,255,0.14)',
        borderWidth: 1,
        titleColor: '#F5F3FF',
        bodyColor: '#C9C4E8',
        padding: 10,
        cornerRadius: 10,
      },
    },
  }

  return (
    <div style={{ height }}>
      <Doughnut data={chartData} options={options} />
    </div>
  )
}
