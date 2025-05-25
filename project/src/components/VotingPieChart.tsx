import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

interface Candidate {
  id: string;
  name: string;
  voteCount: string;
}

interface VotingPieChartProps {
  candidates: Candidate[];
}

const VotingPieChart: React.FC<VotingPieChartProps> = ({ candidates }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (candidates.length > 0 && chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        // Filter out candidates with 0 votes for better visualization
        const candidatesWithVotes = candidates.filter(c => parseInt(c.voteCount) > 0);
        
        // If no one has votes yet, show all candidates
        const dataSet = candidatesWithVotes.length > 0 ? candidatesWithVotes : candidates;
        
        chartInstance.current = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: dataSet.map(c => c.name),
            datasets: [{
              label: 'Vote Distribution',
              data: dataSet.map(c => parseInt(c.voteCount)),
              backgroundColor: [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)',
                'rgba(255, 159, 64, 0.6)',
                'rgba(199, 199, 199, 0.6)',
                'rgba(83, 102, 255, 0.6)',
                'rgba(159, 183, 64, 0.6)',
                'rgba(180, 199, 199, 0.6)'
              ],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'right',
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.raw || 0;
                    const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                    const percentage = total > 0 ? Math.round((value as number / total) * 100) : 0;
                    return `${label}: ${value} votes (${percentage}%)`;
                  }
                }
              }
            }
          }
        });
      }
    }
  }, [candidates]);

  return (
    <div className="w-full h-full">
      <canvas ref={chartRef} height="250"></canvas>
    </div>
  );
};

export default VotingPieChart;
