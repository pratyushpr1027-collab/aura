import React, { useRef, useEffect } from 'react';
import { EnvironmentData } from '../types';

interface EnvironmentCardProps {
  data: EnvironmentData;
}

const EnvironmentCard: React.FC<EnvironmentCardProps> = ({ data }) => {
  const { temperature, humidity, light } = data;

  const tempRef = useRef<HTMLDivElement>(null);
  const humidityRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    tempRef.current?.classList.add('animate-pulse-value');
    const timer = setTimeout(() => tempRef.current?.classList.remove('animate-pulse-value'), 700);
    return () => clearTimeout(timer);
  }, [temperature]);

  useEffect(() => {
    humidityRef.current?.classList.add('animate-pulse-value');
    const timer = setTimeout(() => humidityRef.current?.classList.remove('animate-pulse-value'), 700);
    return () => clearTimeout(timer);
  }, [humidity]);
  
  useEffect(() => {
    lightRef.current?.classList.add('animate-pulse-value');
    const timer = setTimeout(() => lightRef.current?.classList.remove('animate-pulse-value'), 700);
    return () => clearTimeout(timer);
  }, [light]);

  const getComfortMessage = () => {
      if (temperature > 26) return "A bit warm in here.";
      if (temperature < 18) return "Feeling a bit chilly.";
      if (humidity > 60) return "Air feels a bit heavy.";
      if (humidity < 30) return "Room is quite dry.";
      return "Environment seems comfortable.";
  }

  return (
    <div className="bg-gray-800/50 p-4 rounded-lg shadow-lg border border-gray-700/50 h-full flex flex-col justify-between">
        <div>
            <h3 className="font-semibold text-gray-300 mb-4">Environment</h3>
            <div className="space-y-4">
                <div className="flex items-center">
                    <i className="fas fa-thermometer-half text-2xl w-8 text-orange-400"></i>
                    <div>
                        <div className="text-gray-400 text-sm">Temperature</div>
                        <div ref={tempRef} className="font-bold text-xl text-gray-200">{temperature.toFixed(1)}°C</div>
                    </div>
                </div>
                <div className="flex items-center">
                    <i className="fas fa-tint text-2xl w-8 text-blue-400"></i>
                    <div>
                        <div className="text-gray-400 text-sm">Humidity</div>
                        <div ref={humidityRef} className="font-bold text-xl text-gray-200">{humidity}%</div>
                    </div>
                </div>
                 <div className="flex items-center">
                    <i className="fas fa-sun text-2xl w-8 text-yellow-300"></i>
                    <div>
                        <div className="text-gray-400 text-sm">Light Level</div>
                        <div ref={lightRef} className="font-bold text-xl text-gray-200">{light} <span className="text-sm font-normal">lux</span></div>
                    </div>
                </div>
            </div>
        </div>
        <div className="text-xs text-gray-500 mt-4 text-right">
            {getComfortMessage()}
        </div>
    </div>
  );
};

export default EnvironmentCard;