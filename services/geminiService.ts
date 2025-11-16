import { GoogleGenAI, Type } from '@google/genai';
// Fix: Add missing type imports
import { Message, Analysis, MentalHealthData, Mood, Recommendation } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const model = 'gemini-2.5-flash';

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        response: {
            type: Type.STRING,
            description: "An empathetic, supportive, and therapeutic response to the user's message. Keep it concise, around 1-3 sentences.",
        },
        analysis: {
            type: Type.OBJECT,
            description: "An analysis of the user's most recent message.",
            properties: {
                sentimentScore: {
                    type: Type.NUMBER,
                    description: "A score from -1 (very negative) to 1 (very positive) representing the sentiment of the user's message.",
                },
                mood: {
                    type: Type.STRING,
                    description: "A single word describing the primary mood of the user's message (e.g., Sad, Anxious, Reflective, Hopeful).",
                },
                subject: {
                    type: Type.STRING,
                    description: "A short phrase (2-3 words) identifying the main subject of the message (e.g., Work Stress, Family Relationships, Self-Reflection).",
                },
                summary: {
                    type: Type.STRING,
                    description: "A brief, one-sentence summary of the user's message.",
                },
                isNegative: {
                    type: Type.BOOLEAN,
                    description: "True if the mood or sentiment is predominantly negative."
                },
                color: {
                    type: Type.STRING,
                    description: "A hex color code (e.g., '#63B3ED') that visually represents the detected mood. Use calming, pastel, or appropriate colors."
                }
            },
            required: ['sentimentScore', 'mood', 'subject', 'summary', 'isNegative', 'color'],
        }
    },
    required: ['response', 'analysis'],
};

// Fix: Add schema for facial analysis
const facialAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        mood: {
            type: Type.STRING,
            description: "A single word describing the primary mood detected from the user's facial expression. Must be one of: Happy, Calm, Neutral, Surprised, Tired, Anxious, Stressed, Sad, Angry.",
            enum: ['Happy', 'Calm', 'Neutral', 'Surprised', 'Tired', 'Anxious', 'Stressed', 'Sad', 'Angry'],
        },
        insight: {
            type: Type.STRING,
            description: "A short, empathetic, one-sentence insight based on the detected mood. For example: 'You seem to be carrying some tension today.' or 'It's wonderful to see you looking so content.'",
        },
        recommendation: {
            type: Type.OBJECT,
            properties: {
                song: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        artist: { type: Type.STRING }
                    },
                    required: ['title', 'artist']
                },
                podcast: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        show: { type: Type.STRING }
                    },
                    required: ['title', 'show']
                },
                exercise: {
                    type: Type.STRING,
                    description: "A simple, short exercise suggestion. e.g., 'A 10-minute walk outside.'"
                },
                activity: {
                    type: Type.STRING,
                    description: "A non-exercise activity suggestion. e.g., 'Spend 15 minutes journaling.'"
                }
            },
            required: ['song', 'podcast', 'exercise', 'activity']
        }
    },
    required: ['mood', 'insight', 'recommendation']
};

// Fix: Add analyzeFacialExpression function
export const analyzeFacialExpression = async (base64ImageData: string, context: MentalHealthData): Promise<{ mood: Mood; insight: string; recommendation: Recommendation; }> => {
    
    const imagePart = {
        inlineData: {
            mimeType: 'image/jpeg',
            data: base64ImageData,
        },
    };

    const latestMood = context.moodLogs.length > 0 ? context.moodLogs[context.moodLogs.length - 1].mood : 'not available';
    const latestActivity = context.activityLogs.length > 0 ? context.activityLogs[context.activityLogs.length - 1].activity : 'not available';

    const textPrompt = `Analyze the user's facial expression in the provided image. Based on their expression and their recent context, provide a mood analysis and personalized recommendations.
    
    User's recent context:
    - Last logged mood: ${latestMood}
    - Last logged activity: ${latestActivity}
    - Current heart rate: ${context.biometrics.heartRate} BPM
    - Current stress level (GSR): ${Math.round((context.biometrics.gsr / 1023) * 100)}%

    Return the analysis in the specified JSON format. The insight should be empathetic. The recommendations should be actionable and simple. The mood must be one of the predefined types.
    `;

    const textPart = { text: textPrompt };

    try {
        const result = await ai.models.generateContent({
            model: model, // Using the multimodal gemini-2.5-flash model
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: facialAnalysisSchema,
            }
        });

        const parsedResult = JSON.parse(result.text);

        if (!parsedResult.mood || !parsedResult.insight || !parsedResult.recommendation) {
            throw new Error("Invalid JSON response format from AI for facial analysis.");
        }

        return parsedResult as { mood: Mood; insight: string; recommendation: Recommendation; };
    } catch (error) {
        console.error("Error calling Gemini API for facial analysis:", error);
        throw new Error("I had trouble analyzing the image. Please try again.");
    }
};


export const analyzeAndRespond = async (history: Message[], newMessage: string): Promise<{ response: string; analysis: Analysis; }> => {
    const systemInstruction = `You are an empathetic AI therapist. Your role is to listen to the user, provide supportive responses, and help them understand their feelings. When you respond, you MUST provide both a conversational reply and a structured analysis of their message in the specified JSON format.`;

    // We can simplify history for the prompt if needed, but for now, we'll just use the new message
    const prompt = `Based on my message below, please provide a therapeutic response and a detailed analysis.
    
    My message: "${newMessage}"`;

    try {
        const result = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
            }
        });

        const parsedResult = JSON.parse(result.text);
        
        // Basic validation
        if (!parsedResult.response || !parsedResult.analysis) {
            throw new Error("Invalid JSON response format from AI.");
        }

        return parsedResult as { response: string; analysis: Analysis; };
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        // Fallback response
        return {
            response: "I'm having a little trouble connecting right now. Could you please try again in a moment?",
            analysis: {
                sentimentScore: 0,
                mood: 'Error',
                subject: 'Connection Issue',
                summary: 'Could not analyze the message due to a technical error.',
                isNegative: true,
                color: '#A0AEC0'
            }
        };
    }
};