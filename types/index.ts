export interface Persona {
  name: string;
  age?: number;
  occupation?: string;
  painPoints: string[];
  goals: string[];
  behaviors: string[];
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
  businessIdea: BusinessIdea | null;
  canvasData: CanvasData | null;
  isLoading: boolean;
  error: string | null;
}

export type GeneratorAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_PERSONA'; payload: Persona }
  | { type: 'SET_BUSINESS_IDEA'; payload: BusinessIdea }
  | { type: 'SET_CANVAS_DATA'; payload: CanvasData }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'COMPLETE_STEP'; payload: number }
  | { type: 'RESET' };

export interface DifyApiRequest {
  inputs: {
    persona?: Persona;
    businessIdea?: BusinessIdea;
    step?: string;
  };
  response_mode: 'blocking';
  user: string;
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