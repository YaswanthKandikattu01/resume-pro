
export interface Job {
  title: string;
  company?: string;
  link: string;
  snippet?: string;
  source?: string;
}

export interface CandidateProfile {
  name: string;
  email: string;
  phone?: string;
}

export interface RoadmapStep {
  title: string;
  description: string;
}

export interface InterviewPrep {
  questions: string[];
  weakAreas: string[];
  mockFocus: string;
}

export interface RepetitionItem {
  word: string;
  count: number;
  suggestion: string;
}

export interface SpellingItem {
  word: string;
  correction: string;
  context: string;
}

export interface AnalysisResult {
  score: number;
  summary: string;
  strengths: string[];
  suggestedProjects: string[]; 
  missingKeywords: string[];
  matchLevel: 'Low' | 'Medium' | 'High';
  jobTitles: string[];
  topSkills: string[];
  experienceLevel: string;
  coldEmail: {
    subject: string;
    body: string;
  };
  coverLetter: string;
  roadmap: RoadmapStep[]; 
  interviewPrep: InterviewPrep; 
  candidateProfile: CandidateProfile;
  // New Features
  repetitionAnalysis: RepetitionItem[];
  spellingErrors: SpellingItem[];
}

export interface Rating {
  id: string;
  candidateName: string;
  candidateEmail: string;
  stars: number;
  timestamp: string;
  resumeScore: number;
}

export interface AppState {
  view: 'landing' | 'input' | 'analyzing' | 'results' | 'how-it-works';
  resumeText: string;
  resumeFile: { data: string; mimeType: string; name: string } | null;
  jobDescription: string;
  analysis: AnalysisResult | null;
  jobs: Job[];
  showRatingModal: boolean;
}
