import React from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const FeatureCard: React.FC<{ icon: string; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-teal-500 text-white mb-4">
            <i className={`fas ${icon} text-xl`}></i>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
    </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <div className="max-w-4xl mx-auto">
            <header className="mb-12">
                <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-4">
                    Meet Your Personal AI Therapist
                </h1>
                <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
                    A private space to understand your thoughts and feelings. Get insights and guidance whenever you need it.
                </p>
                <button 
                    onClick={onGetStarted}
                    className="mt-8 px-8 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors duration-300 transform hover:scale-105"
                >
                    Get Started
                </button>
            </header>

            <main>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard 
                        icon="fa-brain"
                        title="Understand Your Thoughts"
                        description="Our AI gently helps you explore your feelings and provides a real-time analysis of your mood and sentiment."
                    />
                    <FeatureCard 
                        icon="fa-chart-line"
                        title="Track Your Mood"
                        description="See patterns in your emotional well-being over time through your conversation history and analysis."
                    />
                    <FeatureCard 
                        icon="fa-lightbulb"
                        title="Get Actionable Advice"
                        description="Receive supportive guidance and suggestions based on your conversations to help you navigate life's challenges."
                    />
                </div>
            </main>
        </div>
    </div>
  );
};

export default LandingPage;
