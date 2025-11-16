export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export interface Analysis {
  sentimentScore: number;
  mood: string;
  subject: string;
  summary: string;
  isNegative: boolean;
  color: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  analysis?: Analysis | null;
  createdAt: string;
}

// Fix: Add all missing type definitions
export type Mood = 'Happy' | 'Calm' | 'Neutral' | 'Surprised' | 'Tired' | 'Anxious' | 'Stressed' | 'Sad' | 'Angry';
export type Activity = 'Meditate' | 'Exercise' | 'Journal' | 'Socialize' | 'Work' | 'Hobby';
export type ActivityLevel = 'Sedentary' | 'Light' | 'Active';

export interface Recommendation {
  song: { title: string; artist: string; };
  podcast: { title: string; show: string; };
  exercise: string;
  activity: string;
}

export interface MoodLog {
  id: string;
  timestamp: string;
  mood: Mood;
  value: number;
  insight?: string;
  recommendation?: Recommendation;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  activity: Activity;
}

export interface JournalEntry {
  id: string;
  timestamp: string;
  title: string;
  text: string;
}

export interface Goal {
  id: string;
  timestamp: string;
  text: string;
  completed: boolean;
}

export interface BiometricData {
  heartRate: number;
  gsr: number;
}

export interface EnvironmentData {
  temperature: number;
  humidity: number;
  light: number;
}

export interface BiometricHistoryEntry extends BiometricData {
  timestamp: string;
}

export interface MentalHealthData {
  moodLogs: MoodLog[];
  activityLogs: ActivityLog[];
  journalEntries: JournalEntry[];
  goals: Goal[];
  biometrics: BiometricData;
  environment: EnvironmentData;
  activityLevel: ActivityLevel;
  biometricHistory: BiometricHistoryEntry[];
}
