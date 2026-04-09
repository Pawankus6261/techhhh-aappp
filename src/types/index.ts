export interface Task {
  id: string | number;
  title?: string;
  question: string;
  answer: string;
  level?: number;
  difficulty?: string;
  category?: string;
  hints?: string; // It's stored as a stringified array in the JSON
}

export interface Team {
  name: string;
  code: string;
  level: number;
  startTime: number;
  endTime?: number;
  status: 'active' | 'completed' | 'disqualified';
  year?: string;
}