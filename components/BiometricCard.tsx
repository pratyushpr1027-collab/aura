import React, { useEffect, useRef } from 'react';
import { BiometricData, ActivityLevel } from '../types';

interface BiometricCardProps {
  data: BiometricData;
  activityLevel: ActivityLevel;
}

const BiometricCard: React.FC<BiometricCardProps> = ({ data, activityLevel }) => {
  const { heartRate, gsr } = data;
  const stressLevel = Math.round((gsr / 1023) * 100);

  const heartRateRef = useRef<HTMLDivElement>(null);
  const stressLevelRef = useRef<HTMLDivElement>(null);

  // Animate on change
  useEffect(() => {
    heartRateRef.current?.classList.add('animate-pulse-value');
    const timer = setTimeout(() => heartRateRef.current?.classList.remove('animate-pulse-value'), 700);
    return () => clearTimeout(timer);
  }, [heartRate]);

  useEffect(() => {
    stressLevelRef.current?.classList.add('animate-pulse-value');
    const timer = setTimeout(() => stressLevelRef.current?.classList.remove('animate-pulse-value'), 700);
    return () => clearTimeout(timer);
  }, [stressLevel]);

  const getStressColor = (level: number) => {
    if (level > 75) return 'text-red-400';
    if (level > 50) return 'text-yellow-400';
    return 'text-teal-400';
  };

  const getHrColor = (hr: number) => {
      if (hr > 100) return 'text-red-400';
      if (hr > 85) return 'text-yellow-400';
      return 'text-teal-400';
  }

  const activityIcon: Record<ActivityLevel, string> = {
      'Sedentary': 'fa-person-sitting',
      'Light': 'fa-person-walking',
      'Active': 'fa-person-running'
  }

  return (
    <div className="bg-gray-800/50 p-4 rounded-lg shadow-lg border border-gray-700/50 h-full flex flex-col justify-between">
        <div>
            <h3 className="font-semibold text-gray-300 mb-4">Live Vitals</h3>
            <div className="space-y-4">
                <div className="flex items-center">
                    <i className={`fas fa-heartbeat text-2xl w-8 transition-colors duration-500 ${getHrColor(heartRate)} animate-[slow-pulse_2.5s_ease-in-out_infinite]`}></i>
                    <div>
                        <div className="text-gray-400 text-sm">Heart Rate</div>
                        <div ref={heartRateRef} className={`font-bold text-xl transition-colors duration-500 ${getHrColor(heartRate)}`}>{heartRate} <span className="text-sm font-normal">BPM</span></div>
                    </div>
                </div>
                <div className="flex items-center">
                    <i className={`fas fa-brain text-2xl w-8 transition-colors duration-500 ${getStressColor(stressLevel)} animate-[slow-pulse_2.5s_ease-in-out_infinite] [animation-delay:-0.5s]`}></i>
                    <div>
                        <div className="text-gray-400 text-sm">Stress Level</div>
                        <div ref={stressLevelRef} className={`font-bold text-xl transition-colors duration-500 ${getStressColor(stressLevel)}`}>{stressLevel} <span className="text-sm font-normal">%</span></div>
                    </div>
                </div>
            </div>
        </div>
        <div className="text-xs text-gray-500 mt-4 flex items-center justify-end gap-2">
            <i className={`fas ${activityIcon[activityLevel]}`}></i>
            <span>Activity: {activityLevel}</span>
        </div>
    </div>
  );
};

export default BiometricCard;