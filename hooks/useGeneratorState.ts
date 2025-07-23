import { useReducer, useCallback } from 'react';
import { GeneratorState, GeneratorAction, Persona, BusinessIdea, CanvasData } from '@/types';

const initialState: GeneratorState = {
  currentStep: 0,
  steps: [
    { id: 'welcome', title: 'Welcome', subtitle: 'はじめに', completed: false },
    { id: 'persona', title: 'Persona', subtitle: 'ペルソナ設定', completed: false },
    { id: 'idea', title: 'Business Idea', subtitle: 'ビジネスアイデア', completed: false },
    { id: 'details', title: 'Details', subtitle: '詳細設定', completed: false },
    { id: 'name', title: 'Business Name', subtitle: 'ビジネス名', completed: false },
    { id: 'canvas', title: 'Lean Canvas', subtitle: 'リーンキャンバス', completed: false },
  ],
  persona: null,
  businessIdea: null,
  canvasData: null,
  isLoading: false,
  error: null,
};

function generatorReducer(state: GeneratorState, action: GeneratorAction): GeneratorState {
  switch (action.type) {
    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload,
      };

    case 'SET_PERSONA':
      return {
        ...state,
        persona: action.payload,
      };

    case 'SET_BUSINESS_IDEA':
      return {
        ...state,
        businessIdea: action.payload,
      };

    case 'SET_CANVAS_DATA':
      return {
        ...state,
        canvasData: action.payload,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };

    case 'COMPLETE_STEP':
      return {
        ...state,
        steps: state.steps.map((step, index) =>
          index === action.payload ? { ...step, completed: true } : step
        ),
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

export function useGeneratorState() {
  const [state, dispatch] = useReducer(generatorReducer, initialState);

  const setStep = useCallback((step: number) => {
    dispatch({ type: 'SET_STEP', payload: step });
  }, []);

  const nextStep = useCallback(() => {
    if (state.currentStep < state.steps.length - 1) {
      dispatch({ type: 'COMPLETE_STEP', payload: state.currentStep });
      dispatch({ type: 'SET_STEP', payload: state.currentStep + 1 });
    }
  }, [state.currentStep, state.steps.length]);

  const prevStep = useCallback(() => {
    if (state.currentStep > 0) {
      dispatch({ type: 'SET_STEP', payload: state.currentStep - 1 });
    }
  }, [state.currentStep]);

  const setPersona = useCallback((persona: Persona) => {
    dispatch({ type: 'SET_PERSONA', payload: persona });
  }, []);

  const setBusinessIdea = useCallback((businessIdea: BusinessIdea) => {
    dispatch({ type: 'SET_BUSINESS_IDEA', payload: businessIdea });
  }, []);

  const setCanvasData = useCallback((canvasData: CanvasData) => {
    dispatch({ type: 'SET_CANVAS_DATA', payload: canvasData });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const generatePersona = useCallback(async (initialInput: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate_persona',
          data: { initialInput },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate persona');
      }

      const { persona } = await response.json();
      setPersona(persona);
      nextStep();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [nextStep, setPersona, setLoading, setError]);

  const refineBusinessIdea = useCallback(async (initialIdea: string) => {
    if (!state.persona) {
      setError('Persona is required to refine business idea');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'refine_business_idea',
          data: { persona: state.persona, initialIdea },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refine business idea');
      }

      const { businessIdea } = await response.json();
      setBusinessIdea(businessIdea);
      nextStep();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [state.persona, nextStep, setBusinessIdea, setLoading, setError]);

  const generateCanvas = useCallback(async () => {
    if (!state.persona || !state.businessIdea) {
      setError('Both persona and business idea are required to generate canvas');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate_canvas',
          data: { persona: state.persona, businessIdea: state.businessIdea },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate canvas');
      }

      const { canvasData } = await response.json();
      setCanvasData(canvasData);
      nextStep();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [state.persona, state.businessIdea, nextStep, setCanvasData, setLoading, setError]);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    state,
    actions: {
      setStep,
      nextStep,
      prevStep,
      setPersona,
      setBusinessIdea,
      setCanvasData,
      setLoading,
      setError,
      generatePersona,
      refineBusinessIdea,
      generateCanvas,
      reset,
    },
  };
}