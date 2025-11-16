import React, { useState, useEffect, useRef, useCallback } from 'react';

const BREATH_CYCLE = 8000; // 4s in, 4s out
const INHALE_DURATION = 4000;

interface BreathingExerciseProps {
  isDashboardWidget?: boolean;
  onNavigate?: () => void;
}

const ambientSounds = [
    { id: 'rain', name: 'Rain', icon: 'fa-cloud-showers-heavy', url: 'https://cdn.pixabay.com/audio/2022/10/20/audio_29329e5c54.mp3' },
    { id: 'forest', name: 'Forest', icon: 'fa-tree', url: 'https://cdn.pixabay.com/audio/2022/11/17/audio_88c14c5221.mp3' },
    { id: 'waves', name: 'Waves', icon: 'fa-water', url: 'https://cdn.pixabay.com/audio/2023/09/10/audio_1737f7146d.mp3' },
];

const BreathingExercise: React.FC<BreathingExerciseProps> = ({ isDashboardWidget = false, onNavigate }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [instruction, setInstruction] = useState<string>('Select a duration to begin');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeAmbientSound, setActiveAmbientSound] = useState<string>('none');
  const [isSoundMenuOpen, setIsSoundMenuOpen] = useState<boolean>(false);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const sessionActiveRef = useRef(isSessionActive);
  const fadeIntervalRef = useRef<number>();

  useEffect(() => {
    sessionActiveRef.current = isSessionActive;
  }, [isSessionActive]);

  const playSound = useCallback((type: 'inhale' | 'exhale' | 'complete') => {
    if (isMuted || !audioCtxRef.current) return;

    const audioCtx = audioCtxRef.current;
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.05);

    if (type === 'inhale') {
      oscillator.frequency.setValueAtTime(261.63, audioCtx.currentTime); // C4
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
    } else if (type === 'exhale') {
      oscillator.frequency.setValueAtTime(220.00, audioCtx.currentTime); // A3
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.8);
    } else if (type === 'complete') {
      oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.0);
    }

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 1.2);
  }, [isMuted]);
  
  const endSession = useCallback(() => {
    setIsSessionActive(false);
    setTimeLeft(0);
    playSound('complete');
    setInstruction('Session complete. Well done!');
    setTimeout(() => setInstruction('Select a duration to begin'), 3000);
  }, [playSound]);

  const startSession = (duration: number) => {
    if (!audioCtxRef.current) {
      try {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.error("Web Audio API is not supported in this browser");
        setIsMuted(true);
        return;
      }
    }
    audioCtxRef.current.resume();
    setTimeLeft(duration);
    setIsSessionActive(true);
  };

  const handleAmbientSoundSelect = (soundId: string) => {
      setActiveAmbientSound(soundId);
      setIsSoundMenuOpen(false);
  };
  
  useEffect(() => {
    if (!isSessionActive) return;
    const timerId = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          endSession();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    return () => clearInterval(timerId);
  }, [isSessionActive, endSession]);

  useEffect(() => {
    if (!isSessionActive) return;
    const updateInstruction = () => {
      setInstruction('Breathe In...');
      playSound('inhale');
      setTimeout(() => {
        if (sessionActiveRef.current) {
          setInstruction('Breathe Out...');
          playSound('exhale');
        }
      }, INHALE_DURATION);
    };
    updateInstruction();
    const instructionInterval = setInterval(updateInstruction, BREATH_CYCLE);
    return () => clearInterval(instructionInterval);
  }, [isSessionActive, playSound]);

  // Effect for ambient sound
  useEffect(() => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }

    const audioEl = ambientAudioRef.current;
    const sound = ambientSounds.find(s => s.id === activeAmbientSound);
    const shouldBePlaying = isSessionActive && !!sound && !isMuted;

    if (shouldBePlaying) {
      let currentAudio = audioEl;
      if (!currentAudio || currentAudio.src !== sound.url) {
        if (currentAudio) currentAudio.pause();
        currentAudio = new Audio(sound!.url);
        currentAudio.loop = true;
        ambientAudioRef.current = currentAudio;
      }

      if (currentAudio.paused) {
        currentAudio.volume = 0;
        currentAudio.play().catch(e => console.error("Error playing ambient sound:", e));
        
        fadeIntervalRef.current = window.setInterval(() => {
          const newVolume = currentAudio!.volume + 0.1;
          if (newVolume < 1) {
            currentAudio!.volume = newVolume;
          } else {
            currentAudio!.volume = 1;
            if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
          }
        }, 100);
      }
    } else if (audioEl && !audioEl.paused) {
      fadeIntervalRef.current = window.setInterval(() => {
        const newVolume = audioEl.volume - 0.1;
        if (newVolume > 0) {
          audioEl.volume = newVolume;
        } else {
          audioEl.pause();
          if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        }
      }, 100);
    }

    return () => {
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
      }
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
    };
  }, [isSessionActive, activeAmbientSound, isMuted]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const containerHeight = isDashboardWidget ? 'h-64' : 'h-[calc(100vh-10rem)]';

  return (
    <div className={`bg-gray-800/50 p-4 rounded-lg shadow-lg border border-gray-700/50 flex flex-col ${containerHeight}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-300">Guided Breathing</h3>
        <div className="flex items-center gap-4">
            <div className="relative">
                <button onClick={() => setIsSoundMenuOpen(!isSoundMenuOpen)} className="text-lg text-gray-400 hover:text-white transition-colors" aria-label="Select ambient sound">
                    <i className="fas fa-music"></i>
                </button>
                {isSoundMenuOpen && (
                    <div className="absolute right-0 bottom-full mb-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-20 p-2 space-y-1">
                        <button onClick={() => handleAmbientSoundSelect('none')} className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-3 text-sm font-medium transition-colors ${activeAmbientSound === 'none' ? 'bg-teal-600/80 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                            <i className="fas fa-ban w-5 text-center"></i>
                            <span>None</span>
                        </button>
                        {ambientSounds.map(sound => (
                            <button key={sound.id} onClick={() => handleAmbientSoundSelect(sound.id)} className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-3 text-sm font-medium transition-colors ${activeAmbientSound === sound.id ? 'bg-teal-600/80 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                                <i className={`fas ${sound.icon} w-5 text-center`}></i>
                                <span>{sound.name}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
             <button onClick={() => setIsMuted(!isMuted)} className="text-lg text-gray-400 hover:text-white transition-colors" aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}>
                <i className={`fas ${isMuted ? 'fa-volume-mute' : 'fa-volume-up'}`}></i>
            </button>
            {isDashboardWidget && (
                <button onClick={onNavigate} className="text-xs text-teal-400 hover:text-teal-300">
                    Fullscreen <i className="fas fa-expand-alt ml-1"></i>
                </button>
            )}
        </div>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center relative">
        <div className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center">
            <div className="absolute inset-0 bg-gray-700/50 rounded-full"></div>
            <div
                className={`absolute inset-0 bg-teal-500/80 rounded-full transition-transform duration-[4000ms] ease-in-out ${
                isSessionActive ? (instruction === 'Breathe In...' ? 'scale-100' : 'scale-25') : 'scale-50'
                }`}
            ></div>
            <div className="z-10 text-center">
                <p className="text-lg font-semibold text-white">{instruction}</p>
                {isSessionActive && <p className="text-2xl font-mono text-gray-300 mt-2">{formatTime(timeLeft)}</p>}
            </div>
        </div>
      </div>

      <div className="mt-4">
        {isSessionActive ? (
          <button
            onClick={endSession}
            className="w-full bg-red-600/80 hover:bg-red-700/80 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            End Session
          </button>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {[1, 3, 5].map(min => (
              <button
                key={min}
                onClick={() => startSession(min * 60)}
                className="bg-gray-700 hover:bg-teal-600/50 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                {min} min
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BreathingExercise;