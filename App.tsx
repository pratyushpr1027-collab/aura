import React, { useState, useRef, useEffect } from 'react';
import LandingPage from './components/Journal'; // Repurposed Journal.tsx as LandingPage.tsx
import ChatDashboard from './components/Dashboard'; // Repurposed Dashboard.tsx as ChatDashboard.tsx

const App: React.FC = () => {
  const [appState, setAppState] = useState<'landing' | 'chat'>('landing');
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleGetStarted = () => {
    setAppState('chat');
    // Attempt to play on first user interaction in case autoplay was blocked
    audioRef.current?.play().catch(error => {
      console.warn("Audio play failed on interaction:", error);
    });
  };

  // Attempt to play music when component mounts, respecting browser autoplay policies
  useEffect(() => {
    const audioEl = audioRef.current;
    if (audioEl) {
      audioEl.play().catch(error => {
        // Autoplay was prevented. It will be triggered by user interaction.
        console.warn("Background music autoplay was prevented by the browser.");
      });
    }
  }, []);

  const toggleMute = () => {
    setIsMuted(prevMuted => !prevMuted);
  };


  return (
    <div className="min-h-screen bg-gray-950 font-sans">
      {appState === 'landing' ? (
        <LandingPage onGetStarted={handleGetStarted} />
      ) : (
        <ChatDashboard />
      )}
      
      {/* Background Audio Player */}
      <audio 
        ref={audioRef} 
        src="https://cdn.pixabay.com/audio/2022/08/04/audio_2dde668d05.mp3" 
        autoPlay 
        loop 
        muted={isMuted}
      />

      {/* Global Mute Button */}
      <button
        onClick={toggleMute}
        className="fixed bottom-4 right-4 z-50 w-12 h-12 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-full text-gray-300 hover:text-white hover:bg-gray-700 transition-all flex items-center justify-center shadow-lg"
        aria-label={isMuted ? 'Unmute background music' : 'Mute background music'}
      >
        <i className={`fas ${isMuted ? 'fa-volume-mute' : 'fa-volume-up'}`}></i>
      </button>
    </div>
  );
};

export default App;