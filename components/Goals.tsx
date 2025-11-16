import React from 'react';
import { Analysis } from '../types';

interface AnalysisPanelProps {
  analysis: Analysis | null;
  isLoading: boolean;
}

const AnalysisItem: React.FC<{ label: string; value: string | number; color?: string; children?: React.ReactNode }> = ({ label, value, color, children }) => (
    <div className="bg-gray-800 p-4 rounded-lg">
        <div className="text-sm text-gray-400 mb-1">{label}</div>
        {children || <div className={`text-lg font-semibold`} style={{ color }}>{value}</div>}
    </div>
);

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ analysis, isLoading }) => {
    if (isLoading && !analysis) {
        return (
            <div>
                <h2 className="text-xl font-bold text-white mb-4">Analysis</h2>
                <div className="space-y-3 animate-pulse">
                    <div className="bg-gray-800 p-4 rounded-lg h-16"></div>
                    <div className="bg-gray-800 p-4 rounded-lg h-16"></div>
                    <div className="bg-gray-800 p-4 rounded-lg h-16"></div>
                    <div className="bg-gray-800 p-4 rounded-lg h-24"></div>
                </div>
            </div>
        );
    }
    
    if (!analysis) {
        return (
            <div>
                <h2 className="text-xl font-bold text-white mb-4">Analysis</h2>
                <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center">
                    <i className="fas fa-search-plus text-4xl mb-4"></i>
                    <p>Your message analysis will appear here once you send a message.</p>
                </div>
            </div>
        );
    }

    const sentimentColor = analysis.sentimentScore > 0.2 ? 'text-green-400' : analysis.sentimentScore < -0.2 ? 'text-red-400' : 'text-yellow-400';

    return (
        <div>
            <h2 className="text-xl font-bold text-white mb-4">Analysis</h2>
            <div className="space-y-3">
                <AnalysisItem label="Mood" value={analysis.mood} color={analysis.color} />

                <AnalysisItem label="Sentiment Score" value={analysis.sentimentScore.toFixed(2)}>
                    <div className="flex items-center gap-2">
                        <div className={`text-lg font-semibold ${sentimentColor}`}>
                            {analysis.sentimentScore.toFixed(2)}
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div className="bg-gray-500 h-2.5 rounded-full" style={{ width: '100%' }}>
                                <div className={`${sentimentColor.replace('text-', 'bg-')} h-2.5 rounded-full`} style={{ width: `${(analysis.sentimentScore + 1) / 2 * 100}%` }}></div>
                            </div>
                        </div>
                    </div>
                </AnalysisItem>

                <AnalysisItem label="Subject" value={analysis.subject} color="#FFFFFF" />

                <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">Summary</div>
                    <p className="text-gray-300 text-base">{analysis.summary}</p>
                </div>
            </div>
        </div>
    );
};

export default AnalysisPanel;
