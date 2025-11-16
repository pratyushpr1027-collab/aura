export type Mood = 'Happy' | 'Calm' | 'Neutral' | 'Anxious' | 'Sad' | 'Angry' | 'Stressed' | 'Tired' | 'Surprised';
export type Activity = 'Meditate' | 'Exercise' | 'Journal' | 'Socialize' | 'Work' | 'Hobby';
export type ActivityLevel = 'Sedentary' | 'Light' | 'Active';

export interface LogEntry {
  id: string;
  timestamp: string;
}

export interface Recommendation {
  song: { title: string; artist: string };
  exercise: string;
  activity: string;
  podcast: { title: string; show: string };
}

export interface MoodLog extends LogEntry {
  mood: Mood;
  value: number; // A numerical representation for charting
  insight?: string; // Optional insight from AI analysis
  recommendation?: Recommendation; // Optional recommendation from AI analysis
}

export interface ActivityLog extends LogEntry {
  activity: Activity;
}

export interface JournalEntry extends LogEntry {
  text: string;
  title: string;
}

export interface Goal {
  id: string;
  text: string;
  completed: boolean;
  timestamp: string;
}

export interface BiometricData {
    heartRate: number; // Beats per minute
    gsr: number; // Galvanic Skin Response (raw value, e.g., 0-1023)
}

export interface EnvironmentData {
    temperature: number; // Celsius
    humidity: number; // Percentage
    light: number; // Lux
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