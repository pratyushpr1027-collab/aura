# Haven - Your Personal AI Therapist & Wellness Dashboard

Haven is a smart, browser-based mental wellness companion designed to act as a private space for understanding your thoughts and feelings. It leverages the power of Google's Gemini AI to provide real-time analysis and empathetic support, integrated with a simulated Internet of Things (IoT) dashboard that tracks your vitals and environment.

![Haven App Screenshot](https://storage.googleapis.com/aistudio-ux-team-public/sdk-pro-assets/haven-screenshot.png)

## ✨ Core Features

*   **🤖 AI Assistant:** Engage in a conversation with an empathetic AI therapist powered by Gemini. It listens, provides supportive guidance, and analyzes your message's mood, sentiment, and subject matter in real-time.
*   **📸 Facial Mood Analysis:** With your permission, Haven uses your device's camera to perform a facial scan. The Gemini multimodal model analyzes your expression to detect your current mood, offering a unique insight and personalized recommendations for music, podcasts, and activities.
*   **🌡️ Real-time IoT Dashboard:** A comprehensive dashboard visualizes simulated live data from your personal "smart" environment:
    *   **Vitals:** Tracks Heart Rate and Galvanic Skin Response (GSR) to represent stress levels.
    *   **Environment:** Monitors ambient temperature, humidity, and light levels.
    *   The simulated data dynamically reacts to your logged moods for a more immersive experience.
*   **📊 Wellness Tracking:**
    *   **Mood & Activity Logging:** Easily log your mood and daily activities to see how they correlate over time.
    *   **Data Visualization:** Interactive charts from Recharts display your history for mood, heart rate, and stress.
    *   **Journaling:** A dedicated space to write down your thoughts and feelings, with past entries saved for reflection.
*   **🎯 Goal Setting:** Set, track, and complete personal wellness goals to stay motivated on your mental health journey.
*   **🧘 Guided Breathing Exercises:** A built-in interactive breathing exercise module with selectable durations and calming ambient soundscapes to help you relax and recenter.
*   **🍃 Ambient Experience:** Features a soothing, animated orb background and optional ambient background music to create a calm and welcoming atmosphere.

## 🛠️ Tech Stack & Key Services

*   **Frontend:** React, TypeScript, Tailwind CSS
*   **AI/ML:** Google Gemini API (`gemini-2.5-flash` for text and multimodal analysis)
*   **Data Visualization:** Recharts
*   **Browser APIs:**
    *   WebRTC (`getUserMedia` API) for camera access.
    *   Web Audio API for generating sounds in the breathing exercise.
    *   Local Storage for persisting user data across sessions.

## 🚀 Getting Started

This application is designed to run in a browser-based development environment like AI Studio or can be run locally with a simple setup.

**Prerequisites:**
*   A modern web browser (Chrome, Firefox, Safari, Edge).
*   An API key for the Google Gemini API.

**Running the Application:**

1.  **Set up the API Key:** The application expects the Gemini API key to be available as an environment variable (`process.env.API_KEY`). If running in an environment like AI Studio, this is typically configured for you.
2.  **Serve the Files:** Open the `index.html` file in your web browser. For local development, it's best to use a simple local server to avoid potential issues with browser security policies.
3.  **Grant Permissions:** The app will request camera permissions when you use the "Scan Face" feature. You must grant permission for this feature to work.

## 📁 File Structure

```
/
├── components/         # All React components for the UI
│   ├── AiAssistant.tsx   # The chat interface with the AI
│   ├── Dashboard.tsx     # The main dashboard layout
│   ├── SensorCard.tsx    # Handles mood logging and facial scan
│   └── ...             # Other UI components
├── hooks/              # Custom React hooks
│   └── useIotData.ts   # Manages all wellness data and IoT simulation
├── services/           # API calls and external services
│   └── geminiService.ts  # Logic for interacting with the Gemini API
├── types.ts            # TypeScript type definitions for the app
├── App.tsx             # Main application component and state management
├── index.html          # The entry point of the application
├── index.tsx           # Renders the React application
└── README.md           # This file
└── package.json        # Project dependencies and metadata
```

## 📜 License

This project is licensed under the MIT License. See the `LICENSE` file for details.
