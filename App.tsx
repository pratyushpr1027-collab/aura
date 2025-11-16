import React, { useState, useRef, useEffect } from 'react';
import LandingPage from './components/Journal'; // Repurposed Journal.tsx as LandingPage.tsx
import ChatDashboard from './components/Dashboard'; // Repurposed Dashboard.tsx as ChatDashboard.tsx
import AnimatedBackground from './components/AnimatedBackground';

const App: React.FC = () => {
  const [appState, setAppState] = useState<'landing' | 'chat'>('landing');
  
  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem('haven-bg-volume');
    return savedVolume !== null ? parseFloat(savedVolume) : 0.5;
  });
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleGetStarted = () => {
    setAppState('chat');
    // Attempt to play on first user interaction in case autoplay was blocked
    audioRef.current?.play().catch(error => {
      console.warn("Audio play failed on interaction:", error);
    });
  };

  // Attempt to play music and set initial volume when component mounts
  useEffect(() => {
    const audioEl = audioRef.current;
    if (audioEl) {
      audioEl.volume = volume;
      audioEl.play().catch(error => {
        // Autoplay was prevented. It will be triggered by user interaction.
        console.warn("Background music autoplay was prevented by the browser.");
      });
    }
  }, []);

  // Effect to save volume to localStorage and apply to audio element
  useEffect(() => {
    const audioEl = audioRef.current;
    if (audioEl) {
      audioEl.volume = volume;
    }
    localStorage.setItem('haven-bg-volume', volume.toString());
  }, [volume]);

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
    const currentlyMuted = isMuted;

    // On unmute, we should ensure audio is playing.
    // This makes the mute button a valid first interaction to start music.
    const audioEl = audioRef.current;
    if (audioEl && currentlyMuted) { 
      audioEl.play().catch(error => {
        console.warn("Audio play failed on unmute interaction:", error);
      });
    }

    // If unmuting when volume is 0, restore it to an audible level
    if (currentlyMuted && volume === 0) {
      setVolume(0.5);
    }

    setIsMuted(!currentlyMuted);
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return 'fa-volume-mute';
    if (volume < 0.5) return 'fa-volume-down';
    return 'fa-volume-up';
  };


  return (
    <div className="min-h-screen bg-transparent font-sans">
      <AnimatedBackground />
      {appState === 'landing' ? (
        <LandingPage onGetStarted={handleGetStarted} />
      ) : (
        <div className="animate-[fadeIn_0.8s_ease-in-out]">
          <ChatDashboard />
        </div>
      )}
      
      {/* Background Audio Player */}
      <audio 
        ref={audioRef} 
        src="https://cdn.pixabay.com/audio/2022/08/04/audio_2dde668d05.mp3" 
        autoPlay 
        loop 
        muted={isMuted}
      />

      {/* Global Mute/Volume Control */}
      <div
        className="fixed bottom-4 right-4 z-50 flex flex-col items-center group"
      >
        <div 
            className="
                mb-2 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-full py-4 px-2
                flex justify-center
                transition-all duration-300 ease-in-out
                h-0 opacity-0 group-hover:h-32 group-hover:opacity-100
            "
        >
            <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-6 h-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-gray-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-teal-400"
                style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                aria-label="Background music volume"
            />
        </div>
        
        <button
          onClick={toggleMute}
          className="w-12 h-12 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-full text-gray-300 hover:text-white hover:bg-gray-700 transition-all flex items-center justify-center shadow-lg"
          aria-label={isMuted ? 'Unmute background music' : 'Mute background music'}
        >
          <i className={`fas ${getVolumeIcon()}`}></i>
        </button>
      </div>
    </div>
  );
};

export default App;