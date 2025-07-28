export interface Persona {
  name: string;
  age?: number;
  occupation?: string;
  painPoints: string[];
  goals: string[];
  behaviors: string[];
}

// Difyから返される新しいペルソナ候補の型
export interface DifyPersonaCandidate {
  id: number;
  description: string;
  needs: {
    explicit: string;
    implicit: string;
  };
}

// Difyのペルソナ生成レスポンスの型
export interface DifyPersonaResponse {
  personas: DifyPersonaCandidate[];
}

export interface BusinessIdea {
  concept: string;
  targetMarket: string;
  uniqueValue: string;
  revenueModel: string;
}

export interface CanvasData {
  problem: string[];
  solution: string[];
  keyMetrics: string[];
  uniqueValueProposition: string[];
  unfairAdvantage: string[];
  channels: string[];
  customerSegments: string[];
  costStructure: string[];
  revenueStreams: string[];
}

export interface GeneratorStep {
  id: string;
  title: string;
  subtitle: string;
  completed: boolean;
}

export interface GeneratorState {
  currentStep: number;
  steps: GeneratorStep[];
  persona: Persona | null;
  personaCandidates: DifyPersonaCandidate[];
  businessIdea: BusinessIdea | null;
  canvasData: CanvasData | null;
  isLoading: boolean;
  error: string | null;
}

export type GeneratorAction =
  | { type: "SET_STEP"; payload: number }
  | { type: "SET_PERSONA"; payload: Persona }
  | { type: "SET_PERSONA_CANDIDATES"; payload: DifyPersonaCandidate[] }
  | { type: "SET_BUSINESS_IDEA"; payload: BusinessIdea }
  | { type: "SET_CANVAS_DATA"; payload: CanvasData }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "COMPLETE_STEP"; payload: number }
  | { type: "RESET" };

export interface DifyApiRequest {
  inputs: Record<string, any>;
  query: string;
  response_mode: "blocking" | "streaming";
  user: string;
  conversation_id?: string;
}

export interface DifyApiResponse {
  answer: string;
  metadata?: {
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
}
