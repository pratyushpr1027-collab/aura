import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MoodLog, BiometricHistoryEntry } from '../types';
import { moodMapping } from '../hooks/useIotData';

interface ChartCardProps {
  moodLogs: MoodLog[];
  biometricHistory: BiometricHistoryEntry[];
}

type ChartType = 'mood' | 'hr' | 'gsr';

const ChartCard: React.FC<ChartCardProps> = ({ moodLogs, biometricHistory }) => {
  const [chartType, setChartType] = useState<ChartType>('mood');

  const formatYAxisMood = (value: number) => {
      const mood = Object.keys(moodMapping).find(key => moodMapping[key as keyof typeof moodMapping].value === value);
      return mood || '';
  }

  const chartConfig = {
      mood: {
          data: moodLogs,
          dataKey: "value",
          stroke: "#38B2AC",
          name: "Mood",
          domain: [0.5, 5.5],
          ticks: Object.values(moodMapping).map((m: { value: number }) => m.value),
          formatter: (value: number, name: string, props: any) => [props.payload.mood, 'Mood'],
          yAxisFormatter: formatYAxisMood,
      },
      hr: {
          data: biometricHistory,
          dataKey: "heartRate",
          stroke: "#F87171",
          name: "Heart Rate (BPM)",
          domain: [50, 120],
          ticks: [50, 70, 90, 110],
          formatter: (value: number) => [`${value} BPM`, 'Heart Rate'],
          yAxisFormatter: (value: number) => `${value}`,
      },
      gsr: {
          data: biometricHistory,
          dataKey: "gsr",
          stroke: "#FBBF24",
          name: "Stress (GSR)",
          domain: [200, 900],
          ticks: [200, 450, 700, 900],
          formatter: (value: number) => {
              const percentage = Math.round((value / 1023) * 100);
              return [`${percentage}%`, 'Stress Level']
          },
          yAxisFormatter: (value: number) => `${Math.round((value / 1023) * 100)}%`,
      }
  };

  const currentChart = chartConfig[chartType];
  const noData = currentChart.data.length === 0;
  const gradientId = `color-${chartType}`;

  return (
    <div className="bg-gray-800/50 p-4 rounded-lg shadow-lg border border-gray-700/50 h-72 md:h-80 flex flex-col">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-300">Data History</h3>
            <div className="flex space-x-1 bg-gray-700/50 p-1 rounded-md">
                {(Object.keys(chartConfig) as ChartType[]).map((type) => (
                     <button key={type} onClick={() => setChartType(type)} className={`px-2 py-1 text-xs rounded-md transition-colors ${chartType === type ? 'bg-teal-600 text-white' : 'text-gray-400 hover:bg-gray-600'}`}>
                        {chartConfig[type].name.split('(')[0].trim()}
                    </button>
                ))}
            </div>
        </div>
      <ResponsiveContainer width="100%" height="100%">
        {noData ? (
            <div className="flex items-center justify-center h-full text-gray-500">
                Log data to see your history here.
            </div>
        ) : (
          <AreaChart
            data={currentChart.data}
            margin={{ top: 5, right: 20, left: -20, bottom: 5, }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={currentChart.stroke} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={currentChart.stroke} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
            <XAxis dataKey="timestamp" stroke="#A0AEC0" fontSize={12} />
            <YAxis 
                stroke="#A0AEC0" 
                fontSize={12} 
                domain={currentChart.domain as [number, number]} 
                ticks={currentChart.ticks}
                tickFormatter={currentChart.yAxisFormatter}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', borderColor: '#4A5568' }} 
              labelStyle={{ color: '#E2E8F0' }}
              formatter={currentChart.formatter}
            />
            <Area 
                type="monotone" 
                dataKey={currentChart.dataKey} 
                name={currentChart.name} 
                stroke={currentChart.stroke} 
                strokeWidth={2} 
                fillOpacity={1} 
                fill={`url(#${gradientId})`} 
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default ChartCard;