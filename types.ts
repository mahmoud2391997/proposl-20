export enum ScreenStage {
  SPLASH = 'SPLASH',
  TEAM_SELECT = 'TEAM_SELECT',
  BRIEFING = 'BRIEFING',
  STORY_NODE_1 = 'STORY_NODE_1',
  SIMULATION = 'SIMULATION',
  STORY_NODE_2 = 'STORY_NODE_2',
  ANALYSIS = 'ANALYSIS',
}

export interface UserProfile {
  name: string;
  role: 'Commander' | 'Specialist' | 'Diplomat';
}

export interface SimulationStats {
  integrity: number; // 0-100
  stabilityDuration: number; // seconds
}

export interface StoryState {
  firstChoice: string | null;
  simulationScore: number; // 0-100
  secondChoice: string | null;
  aiFeedback: string | null;
}

export interface StoryContent {
  narrative: string;
  options: {
    label: string;
    value: string;
  }[];
  backgroundImage?: string;
}