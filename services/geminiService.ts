import { GoogleGenAI, Type } from '@google/genai';
import { MentalHealthData, Mood, Recommendation } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

type AiActionResult = { action: 'respond'; payload: { text: string } };

export const handleAiCommand = async (prompt: string, healthData: MentalHealthData): Promise<AiActionResult> => {
  const model = 'gemini-2.5-flash';
  
  // Create summaries of recent data
  const recentMoods = healthData.moodLogs.slice(-5).map(log => log.mood).join(', ') || 'None logged recently.';
  const recentActivities = healthData.activityLogs.slice(-5).map(log => log.activity).join(', ') || 'None logged recently.';
  const journalSummary = healthData.journalEntries.length > 0
    ? `The user has ${healthData.journalEntries.length} journal entries. The latest one is titled "${healthData.journalEntries[0].title}".`
    : 'No journal entries have been made.';
  const stressLevel = Math.round((healthData.biometrics.gsr / 1023) * 100);
  const goalsSummary = healthData.goals.length > 0
    ? `The user has ${healthData.goals.length} goals. ${healthData.goals.filter(g => !g.completed).length} are still active.`
    : 'No goals have been set yet.';

  // fix: Removed the user prompt from the system instruction, as it's passed separately in `contents`.
  const systemInstruction = `You are Haven AI, a supportive and empathetic companion for mental wellness. Your role is to provide encouragement, gentle insights, and helpful suggestions based on the user's logged data. Correlate all available data points for holistic insights.

  **IMPORTANT RULES:**
  1.  **DO NOT PROVIDE MEDICAL ADVICE.** You are not a doctor or therapist. If the user seems to be in serious distress, gently suggest they talk to a qualified professional.
  2.  Be positive, empathetic, and non-judgmental.
  3.  Keep your responses concise and easy to understand.
  4.  Base your insights on the data provided.

  **Current User Data Summary:**
  - **Recent Moods:** ${recentMoods}
  - **Recent Activities:** ${recentActivities}
  - **Journaling:** ${journalSummary}
  - **Wellness Goals:** ${goalsSummary}
  - **Current Biometrics:** Heart Rate is ${healthData.biometrics.heartRate} BPM. Stress level is ${stressLevel}%.
  - **Current Environment:** The room is ${healthData.environment.temperature}°C, ${healthData.environment.humidity}% humidity, with a light level of ${healthData.environment.light} lux.
  - **Current Physical Activity:** The user is currently ${healthData.activityLevel}.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt, // The user's message is the main content
      config: {
          systemInstruction: systemInstruction,
      }
    });

    return { action: 'respond', payload: { text: response.text } };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return { action: 'respond', payload: { text: "I'm having a little trouble connecting right now. Please try again in a moment." } };
  }
};

export const analyzeFacialExpression = async (base64ImageData: string, healthData: MentalHealthData): Promise<{ mood: Mood; insight: string; recommendation: Recommendation }> => {
  const model = 'gemini-2.5-flash';
  
  const recentActivities = healthData.activityLogs.slice(-3).map(log => log.activity).join(', ') || 'None recently.';
  const journalSummary = healthData.journalEntries.length > 0
    ? `The latest journal entry is titled "${healthData.journalEntries[0].title}".`
    : 'No recent journal entries.';

  const prompt = `Analyze the facial expression in this image to determine the user's primary mood. Based on the detected mood AND the provided user context, generate personalized recommendations.

  **User Context:**
  - **Recent Activities:** ${recentActivities}
  - **Journaling:** ${journalSummary}

  Respond with only a JSON object containing:
  1. 'mood': one of 'Happy', 'Calm', 'Neutral', 'Anxious', 'Sad', 'Angry', 'Stressed', 'Tired', 'Surprised'.
  2. 'insight': a short, supportive insight (max 20 words) that connects the mood to their context if possible.
  3. 'recommendation': an object with four creative, diverse, and context-aware suggestions to improve or maintain the mood:
     - 'song' (with 'title' and 'artist')
     - 'exercise' (a simple, actionable suggestion, e.g., '10-minute walk', 'gentle stretching')
     - 'activity' (another simple suggestion, e.g., 'brew a cup of tea', 'doodle for 5 minutes')
     - 'podcast' (with episode 'title' and show 'show').
  Be varied and creative in your suggestions, making them relevant to the user's situation.`;

  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64ImageData,
    },
  };

  const textPart = { text: prompt };

  const validMoods: Mood[] = ['Happy', 'Calm', 'Neutral', 'Anxious', 'Sad', 'Angry', 'Stressed', 'Tired', 'Surprised'];

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mood: {
              type: Type.STRING,
              enum: validMoods,
            },
            insight: {
              type: Type.STRING,
            },
            recommendation: {
              type: Type.OBJECT,
              properties: {
                song: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    artist: { type: Type.STRING },
                  },
                  required: ['title', 'artist'],
                },
                exercise: {
                  type: Type.STRING,
                  description: "A simple, actionable exercise recommendation (e.g., '10-minute walk').",
                },
                activity: {
                  type: Type.STRING,
                  description: "Another simple activity suggestion (e.g., 'brew a cup of tea').",
                },
                podcast: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    show: { type: Type.STRING },
                  },
                  required: ['title', 'show'],
                }
              },
              required: ['song', 'exercise', 'activity', 'podcast'],
            },
          },
          required: ['mood', 'insight', 'recommendation'],
        },
      },
    });

    const result = JSON.parse(response.text);

    // Basic validation to ensure the result is in the expected format.
    if (result && 
        validMoods.includes(result.mood) && 
        typeof result.insight === 'string' && 
        typeof result.recommendation === 'object' &&
        typeof result.recommendation.song === 'object' &&
        typeof result.recommendation.song.title === 'string' &&
        typeof result.recommendation.song.artist === 'string' &&
        typeof result.recommendation.exercise === 'string' &&
        typeof result.recommendation.activity === 'string' &&
        typeof result.recommendation.podcast === 'object' &&
        typeof result.recommendation.podcast.title === 'string' &&
        typeof result.recommendation.podcast.show === 'string'
        ) {
      return result as { mood: Mood; insight: string; recommendation: Recommendation };
    } else {
      throw new Error("Invalid response format from AI.");
    }

  } catch (error) {
    console.error("Error calling Gemini API for image analysis:", error);
    // Provide a fallback or re-throw
    throw new Error("I had trouble analyzing the image. Please try again.");
  }
};