
export interface StudentRecord {
  id: string;
  name: string;
  age: number;
  city: string;
  state: string;
  schoolName: string;
  schoolType: 'College' | 'High School';
  schoolState: string;
  schoolCity: string;
  cumulativeGpa: number;
  unweightedGpa: number;
  weightedGpa: number;
  rigorCoursesCount: number;
  creditsEarned: number;
  majorInterest?: string;
  graduationYear: number;
}

export enum ChartType {
  BAR = 'BAR',
  LINE = 'LINE',
  PIE = 'PIE',
  SCATTER = 'SCATTER',
  NONE = 'NONE'
}

export interface AnalysisResponse {
  answer: string;
  calculationSummary?: string;
  visualization?: {
    type: ChartType;
    data: any[];
    xAxisLabel: string;
    yAxisLabel: string;
    title: string;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  analysis?: AnalysisResponse;
  timestamp: Date;
}
