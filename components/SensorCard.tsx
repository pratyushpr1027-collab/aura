import React, { useState, useRef, useEffect } from 'react';
import { Mood, Recommendation, MentalHealthData } from '../types';
import { moodMapping } from '../hooks/useIotData';
import { analyzeFacialExpression } from '../services/geminiService';

interface SensorCardProps {
  onLogMood: (mood: Mood, insight?: string, recommendation?: Recommendation) => void;
  data: MentalHealthData;
}

const SensorCard: React.FC<SensorCardProps> = ({ onLogMood, data }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{ mood: Mood; insight: string; recommendation: Recommendation; } | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // For analysis animation
  const [analyzingMood, setAnalyzingMood] = useState<Mood>('Neutral');
  const analysisIntervalRef = useRef<number | null>(null);

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const startAnalysisAnimation = () => {
    const moods = Object.keys(moodMapping) as Mood[];
    analysisIntervalRef.current = window.setInterval(() => {
      const randomMood = moods[Math.floor(Math.random() * moods.length)];
      setAnalyzingMood(randomMood);
    }, 200);
  };

  const stopAnalysisAnimation = () => {
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
  };

  const handleOpenModal = async () => {
    if (isCameraStarting || isModalOpen) return;
    setIsCameraStarting(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Camera access denied:", err);
      setError("Camera access is required. Please enable it in your browser settings.");
    } finally {
      setIsCameraStarting(false);
    }
  };

  const handleCloseModal = () => {
    stopStream();
    stopAnalysisAnimation();
    setIsModalOpen(false);
    setIsProcessing(false);
    setAnalysisResult(null);
  };

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsProcessing(true);
    setError(null);
    setAnalysisResult(null);
    startAnalysisAnimation();

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    const base64ImageData = canvas.toDataURL('image/jpeg').split(',')[1];

    try {
      const result = await analyzeFacialExpression(base64ImageData, data);
      if (result && moodMapping[result.mood]) {
        setAnalysisResult(result);
        onLogMood(result.mood, result.insight, result.recommendation);
      } else {
        throw new Error('Received an invalid mood from the analysis.');
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during analysis.';
      setError(errorMessage);
      setAnalysisResult(null); // Clear any partial results on error
    } finally {
      setIsProcessing(false);
      stopAnalysisAnimation();
    }
  };

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    return () => {
      stopStream();
      stopAnalysisAnimation();
    };
  }, []);

  const currentMoodData = analysisResult ? moodMapping[analysisResult.mood] : null;

  return (
    <>
      <div className="bg-gray-800/50 p-4 rounded-lg shadow-lg border border-gray-700/50 h-full flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-gray-300 mb-3">How are you feeling?</h3>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(moodMapping) as Mood[]).map((mood) => (
              <button
                key={mood}
                onClick={() => onLogMood(mood as Mood)}
                className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-700 hover:bg-teal-600/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400"
                aria-label={`Log mood as ${mood}`}
              >
                <i className={`fas ${moodMapping[mood as Mood].icon} text-2xl`} style={{ color: moodMapping[mood as Mood].color }}></i>
                <span className="text-xs mt-2 text-gray-300">{mood}</span>
              </button>
            ))}
          </div>
        </div>
        <button 
          onClick={handleOpenModal}
          disabled={isCameraStarting}
          className="mt-4 w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 disabled:cursor-wait text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isCameraStarting ? (
              <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Opening Camera...</span>
              </>
          ) : (
              <>
                  <i className="fas fa-camera"></i>
                  <span>Scan Face</span>
              </>
          )}
        </button>
        {error && <p className="text-red-400 text-xs text-center mt-2">{error}</p>}
      </div>
      
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-lg shadow-2xl border border-gray-700 max-w-lg w-full relative">
            <h3 
              className="text-xl font-bold mb-4 text-center transition-colors duration-300"
              style={{ color: analysisResult && currentMoodData ? currentMoodData.color : 'inherit' }}
            >
              {isProcessing 
                ? "Analyzing..." 
                : analysisResult 
                  ? `Detected Mood: ${analysisResult.mood}` 
                  : "Facial Scan"
              }
            </h3>
            <div className="relative bg-black rounded-md overflow-hidden">
                {analysisResult && currentMoodData ? (
                  <div className="w-full flex flex-col items-center p-6 bg-gray-900 overflow-y-auto" style={{ maxHeight: '65vh' }}>
                    <i className={`fas ${currentMoodData.icon} text-9xl mt-4 mb-6`} style={{ color: currentMoodData.color }}></i>
                    
                    <div className="w-full space-y-2">
                      <div className="p-3 bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                              <i className="fas fa-music text-lg w-5 text-center text-teal-300"></i>
                              <div>
                                  <h5 className="text-xs text-teal-300 font-semibold uppercase tracking-wider">Listen</h5>
                                  <p className="text-gray-200 text-sm">{analysisResult.recommendation.song.title} by {analysisResult.recommendation.song.artist}</p>
                              </div>
                          </div>
                      </div>
                       <div className="p-3 bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                              <i className="fas fa-podcast text-lg w-5 text-center text-teal-300"></i>
                              <div>
                                  <h5 className="text-xs text-teal-300 font-semibold uppercase tracking-wider">Podcast</h5>
                                  <p className="text-gray-200 text-sm">{analysisResult.recommendation.podcast.title} on {analysisResult.recommendation.podcast.show}</p>
                              </div>
                          </div>
                      </div>
                      <div className="p-3 bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                              <i className="fas fa-dumbbell text-lg w-5 text-center text-teal-300"></i>
                              <div>
                                  <h5 className="text-xs text-teal-300 font-semibold uppercase tracking-wider">Move</h5>
                                  <p className="text-gray-200 text-sm">{analysisResult.recommendation.exercise}</p>
                              </div>
                          </div>
                      </div>
                      <div className="p-3 bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                              <i className="fas fa-hand-holding-heart text-lg w-5 text-center text-teal-300"></i>
                              <div>
                                  <h5 className="text-xs text-teal-300 font-semibold uppercase tracking-wider">Do</h5>
                                  <p className="text-gray-200 text-sm">{analysisResult.recommendation.activity}</p>
                              </div>
                          </div>
                      </div>
                    </div>

                    <div className="mt-6 w-full p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                        <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                            <i className="fas fa-file-alt text-teal-400"></i>
                            <span>Your Quick Summary</span>
                        </h4>
                        <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm">
                            <li>
                                <strong className="font-semibold text-gray-200">Mood:</strong> {analysisResult.mood}
                            </li>
                            <li>
                                <strong className="font-semibold text-gray-200">Insight:</strong> <span className="italic">"{analysisResult.insight}"</span>
                            </li>
                            <li>
                                <strong className="font-semibold text-gray-200">Next Steps:</strong>
                                <ul className="list-disc list-inside ml-5 mt-1 text-gray-400">
                                    <li>Listen to "{analysisResult.recommendation.song.title}"</li>
                                    <li>Try the podcast "{analysisResult.recommendation.podcast.title}"</li>
                                    <li>Consider: {analysisResult.recommendation.exercise}</li>
                                    <li>Relax with: {analysisResult.recommendation.activity}</li>
                                </ul>
                            </li>
                        </ul>
                    </div>

                    <p className="text-teal-400 text-xs mt-6">✓ Mood and insight logged</p>
                  </div>
                ) : (
                  <div className="aspect-video">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                  </div>
                )}

                {isProcessing && (
                    <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center text-white transition-all duration-200">
                        <i className={`fas ${moodMapping[analyzingMood].icon} text-5xl mb-4 animate-pulse`} style={{ color: moodMapping[analyzingMood].color }}></i>
                        <span className="font-semibold text-lg">Analyzing: {analyzingMood}...</span>
                    </div>
                )}
            </div>
            
            {error && !isCameraStarting && (
              <p className="text-red-400 text-sm text-center my-2">{error}</p>
            )}

            <div className="mt-4">
                {analysisResult || (error && !isCameraStarting) ? (
                    <div className="flex justify-center">
                        <button onClick={handleCloseModal} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                            {analysisResult ? 'Done' : 'Close'}
                        </button>
                    </div>
                ) : (
                    <div className="flex justify-between items-center">
                    <button
                        onClick={handleCloseModal}
                        disabled={isProcessing}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCapture}
                        disabled={isProcessing}
                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:bg-teal-800 disabled:cursor-wait"
                    >
                        {isProcessing ? (
                            <> <i className="fas fa-spinner fa-spin"></i> <span>Processing</span> </>
                        ) : (
                            <> <i className="fas fa-camera-retro"></i> <span>Capture</span> </>
                        )}
                    </button>
                    </div>
                )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SensorCard;