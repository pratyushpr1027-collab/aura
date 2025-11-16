import React, { useState, useRef, useEffect } from 'react';
import { Mood, Recommendation, MentalHealthData } from '../types';
import { moodMapping } from '../hooks/useIotData';
import { analyzeFacialExpression } from '../services/geminiService';

interface SensorCardProps {
  onLogMood: (mood: Mood, insight?: string, recommendation?: Recommendation) => void;
  data: MentalHealthData;
}

const SensorCard: React.FC<SensorCardProps> = ({ onLogMood, data }) => {
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
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

  const handleOpenCameraModal = async () => {
    if (isCameraStarting || isCameraModalOpen) return;
    setIsCameraStarting(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setIsCameraModalOpen(true);
    } catch (err) {
      console.error("Camera access denied:", err);
      setError("Camera access is required. Please enable it in your browser settings.");
    } finally {
      setIsCameraStarting(false);
    }
  };

  const handleCloseCameraModal = () => {
    stopStream();
    stopAnalysisAnimation();
    setIsCameraModalOpen(false);
    setIsProcessing(false);
  };

  const handleCloseResultModal = () => {
    setIsResultModalOpen(false);
    setAnalysisResult(null);
  };

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsProcessing(true);
    setError(null);
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
        handleCloseCameraModal();
        setIsResultModalOpen(true);
      } else {
        throw new Error('Received an invalid mood from the analysis.');
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during analysis.';
      setError(errorMessage);
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
      <div className="bg-gray-800/50 p-4 rounded-lg shadow-lg border border-gray-700/50 h-full flex flex-col">
        <h3 className="font-semibold text-gray-300 mb-4 text-center">How are you feeling?</h3>

        <div className="flex-grow flex items-center justify-center my-2">
            <button
            onClick={handleOpenCameraModal}
            disabled={isCameraStarting}
            className="w-40 h-40 lg:w-48 lg:h-48 rounded-full border-2 border-dashed border-gray-600 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-700/50 hover:border-teal-500 hover:text-white transition-all duration-300 animate-[subtle-pulse_2.5s_ease-out_infinite] focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:cursor-wait disabled:animate-none"
            aria-label="Scan face to detect mood"
            >
            {isCameraStarting ? (
                <>
                <i className="fas fa-spinner fa-spin text-3xl mb-3"></i>
                <span className="font-semibold">Starting...</span>
                </>
            ) : (
                <>
                <i className="fas fa-camera text-4xl mb-3"></i>
                <span className="font-semibold">Scan Face</span>
                </>
            )}
            </button>
        </div>

        <div className="relative my-4 flex-shrink-0">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center">
            <span className="bg-gray-800 px-2 text-xs text-gray-500 uppercase tracking-wider">Or Log Manually</span>
            </div>
        </div>

        <div className="grid grid-cols-3 gap-2 flex-shrink-0">
            {(Object.keys(moodMapping) as Mood[]).map((mood) => (
              <button
                key={mood}
                onClick={() => onLogMood(mood as Mood)}
                className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-700/50 hover:bg-teal-600/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400 transform hover:scale-105 active:scale-100"
                aria-label={`Log mood as ${mood}`}
                title={mood}
              >
                <i className={`fas ${moodMapping[mood as Mood].icon} text-xl`} style={{ color: moodMapping[mood as Mood].color }}></i>
                <span className="text-xs mt-1.5 text-gray-400">{mood}</span>
              </button>
            ))}
        </div>
        {error && <p className="text-red-400 text-xs text-center mt-2 flex-shrink-0">{error}</p>}
      </div>
      
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

      {/* Camera Modal */}
      {isCameraModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300 animate-[fadeIn_0.3s_ease-out]">
          <div className="bg-gray-800 p-6 rounded-lg shadow-2xl border border-gray-700 max-w-3xl w-full relative transition-transform duration-300 animate-[slideInUp_0.4s_ease-out]">
            <h3 className="text-xl font-bold mb-4 text-center">
              {isProcessing ? "Analyzing..." : "Facial Scan"}
            </h3>
            <div className="relative bg-black rounded-md overflow-hidden aspect-video">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
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

            <div className="mt-4 flex justify-between items-center">
              <button
                  onClick={handleCloseCameraModal}
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
          </div>
        </div>
      )}

      {/* Result Modal */}
      {isResultModalOpen && analysisResult && currentMoodData && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300 animate-[fadeIn_0.3s_ease-out]">
          <div className="bg-gray-800 p-6 rounded-lg shadow-2xl border border-gray-700 max-w-3xl w-full relative transition-transform duration-300 animate-[slideInUp_0.4s_ease-out]">
            <h3 
              className="text-xl font-bold mb-4 text-center transition-colors duration-300"
              style={{ color: currentMoodData.color }}
            >
              Analysis Complete: {analysisResult.mood}
            </h3>
            
            <div className="w-full flex flex-col items-center bg-gray-900/50 p-4 rounded-lg overflow-y-auto" style={{ maxHeight: '75vh' }}>
                <div className="w-full grid md:grid-cols-2 gap-8 items-center">
                    {/* Left Column: Icon and Insight */}
                    <div className="text-center animate-[slideInUp_0.5s_ease-out]">
                        <i className={`fas ${currentMoodData.icon} text-9xl mb-4`} style={{ color: currentMoodData.color }}></i>
                        <p className="text-lg text-gray-300 italic">"{analysisResult.insight}"</p>
                    </div>

                    {/* Right Column: Recommendations */}
                    <div className="space-y-4 animate-[slideInUp_0.5s_ease-out] [animation-delay:100ms] opacity-0" style={{animationFillMode: 'forwards'}}>
                        <h4 className="text-xl font-semibold text-white mb-2 text-center md:text-left">Your Recommendations</h4>
                        <div className="p-3 bg-gray-800 rounded-lg flex items-center gap-4">
                            <i className="fas fa-music text-2xl w-8 text-center text-teal-300"></i>
                            <div>
                                <h5 className="text-xs text-teal-300 font-semibold uppercase tracking-wider">Listen</h5>
                                <p className="text-gray-200">{analysisResult.recommendation.song.title} by {analysisResult.recommendation.song.artist}</p>
                            </div>
                        </div>
                        <div className="p-3 bg-gray-800 rounded-lg flex items-center gap-4">
                            <i className="fas fa-podcast text-2xl w-8 text-center text-teal-300"></i>
                            <div>
                                <h5 className="text-xs text-teal-300 font-semibold uppercase tracking-wider">Podcast</h5>
                                <p className="text-gray-200">{analysisResult.recommendation.podcast.title} on {analysisResult.recommendation.podcast.show}</p>
                            </div>
                        </div>
                        <div className="p-3 bg-gray-800 rounded-lg flex items-center gap-4">
                            <i className="fas fa-dumbbell text-2xl w-8 text-center text-teal-300"></i>
                            <div>
                                <h5 className="text-xs text-teal-300 font-semibold uppercase tracking-wider">Move</h5>
                                <p className="text-gray-200">{analysisResult.recommendation.exercise}</p>
                            </div>
                        </div>
                        <div className="p-3 bg-gray-800 rounded-lg flex items-center gap-4">
                            <i className="fas fa-hand-holding-heart text-2xl w-8 text-center text-teal-300"></i>
                            <div>
                                <h5 className="text-xs text-teal-300 font-semibold uppercase tracking-wider">Do</h5>
                                <p className="text-gray-200">{analysisResult.recommendation.activity}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <p className="text-teal-400 text-xs mt-6 animate-[fadeIn_0.5s_ease-out] [animation-delay:300ms]">✓ Mood and insight logged</p>
            </div>

            <div className="mt-6 flex justify-center">
                <button onClick={handleCloseResultModal} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    Done
                </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SensorCard;