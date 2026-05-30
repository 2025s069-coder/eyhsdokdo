export interface HistoricalSource {
  id: string;
  title: string;
  year: number;
  origin: "Korea" | "Japan";
  type: "document" | "map";
  description: string;
  quote?: string;
  significance: string;
  imageUrl?: string;
}

export interface CurvaturePoint {
  name: string;
  distance: number; // km
  height: number; // m
  visible: boolean;
  explanation: string;
}

export interface EvaluationResponse {
  score: number;
  strengths: string;
  improvements: string;
  teacherComment: string;
}

export interface ReflectionQuestion {
  id: string;
  num: number;
  text: string;
  placeholder: string;
}
