import { Task } from '@/types';

export const fetchTasks = async (): Promise<any[]> => {
  try {
    const response = await fetch('/data/question.json');
    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
};

export const fetchTeams = async (): Promise<any[]> => {
  try {
    const response = await fetch('/data/teams.json');
    if (!response.ok) {
      throw new Error('Failed to fetch teams');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching teams:', error);
    return [];
  }
};
