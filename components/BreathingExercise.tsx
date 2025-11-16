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
    { id: 'river', name: 'River', icon: 'fa-leaf', url: 'https://cdn.pixabay.com/audio/2022/04/24/audio_323b17c09d.mp3' },
];
const allSoundOptions = [{ id: 'none', name: 'None', icon: 'fa-ban' }, ...ambientSounds];

const BreathingExercise: React.FC<BreathingExerciseProps> = ({ isDashboardWidget = false, onNavigate }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [instruction, setInstruction] = useState<string>('Select a duration to begin');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeAmbientSound, setActiveAmbientSound] = useState<string>('none');
  const [isSoundMenuOpen, setIsSoundMenuOpen] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(() => {
    const savedVolume = localStorage.getItem('haven-breathing-volume');
    return savedVolume !== null ? parseFloat(savedVolume) : 0.5;
  });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const sessionActiveRef = useRef(isSessionActive);
  const fadeIntervalRef = useRef<number>();
  
  useEffect(() => {
    localStorage.setItem('haven-breathing-volume', volume.toString());
  }, [volume]);

  useEffect(() => {
    sessionActiveRef.current = isSessionActive;
  }, [isSessionActive]);

  const playSound = useCallback((type: 'inhale' | 'exhale' | 'complete') => {
    if (isMuted || !audioCtxRef.current || volume === 0) return;

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
    gainNode.gain.linearRampToValueAtTime(0.2 * volume, audioCtx.currentTime + 0.05);

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
  }, [isMuted, volume]);
  
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

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    } else if (newVolume === 0 && !isMuted) {
      setIsMuted(true);
    }
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    if (!newMutedState && volume === 0) {
      setVolume(0.5); // Restore volume if unmuting at 0
    }
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
    const shouldBePlaying = isSessionActive && !!sound && !isMuted && volume > 0;

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
          if (!ambientAudioRef.current) return;
          const currentVol = ambientAudioRef.current.volume;
          const newVolume = Math.min(currentVol + 0.1, volume); // Fade up to target volume
          ambientAudioRef.current.volume = newVolume;
          if (newVolume >= volume) {
            if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
          }
        }, 100);
      } else {
         currentAudio.volume = volume;
      }
    } else if (audioEl && !audioEl.paused) {
      fadeIntervalRef.current = window.setInterval(() => {
        if (!ambientAudioRef.current) return;
        const newVolume = ambientAudioRef.current.volume - 0.1;
        if (newVolume > 0) {
          ambientAudioRef.current.volume = newVolume;
        } else {
          ambientAudioRef.current.pause();
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
  }, [isSessionActive, activeAmbientSound, isMuted, volume]);

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
                    <div className="absolute right-0 bottom-full mb-2 w-60 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl z-20 p-3 animate-[fadeIn_0.2s_ease-out]">
                        <h4 className="text-xs font-semibold text-gray-400 mb-2 text-center uppercase tracking-wider">Ambient Sound</h4>
                        
                        <div className="grid grid-cols-3 gap-2 mb-3">
                            {allSoundOptions.map(sound => (
                                <button
                                    key={sound.id}
                                    onClick={() => handleAmbientSoundSelect(sound.id)}
                                    className={`
                                        flex flex-col items-center justify-center p-2 rounded-lg aspect-square
                                        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-teal-400
                                        ${activeAmbientSound === sound.id
                                            ? 'bg-teal-600/80 text-white'
                                            : 'bg-gray-700/50 hover:bg-gray-700 text-gray-300'
                                        }
                                    `}
                                    aria-label={sound.name}
                                >
                                    <i className={`fas ${sound.icon} text-xl`}></i>
                                    <span className="text-[10px] mt-1 truncate">{sound.name}</span>
                                </button>
                            ))}
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <i className={`fas ${volume === 0 || isMuted ? 'fa-volume-mute' : 'fa-volume-down'} text-gray-400 w-4 text-center`}></i>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-teal-400"
                                aria-label="Sound volume"
                            />
                             <i className="fas fa-volume-up text-gray-400 w-4 text-center"></i>
                        </div>
                    </div>
                )}
            </div>
             <button onClick={toggleMute} className="text-lg text-gray-400 hover:text-white transition-colors" aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}>
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
            <div className="absolute inset-0 bg-gray-700 rounded-full animate-[gentle-pulse_8s_ease-in-out_infinite]"></div>
            <div
                className={`absolute inset-0 bg-teal-500/80 rounded-full transition-transform duration-[4000ms] ease-in-out ${
                isSessionActive ? (instruction === 'Breathe In...' ? 'scale-100' : 'scale-25') : 'scale-50'
                }`}
            ></div>
            <div className="z-10 text-center">
                <p key={instruction} className="text-lg font-semibold text-white animate-[fadeIn_0.8s]">{instruction}</p>
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