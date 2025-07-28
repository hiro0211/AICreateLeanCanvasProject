import { useReducer, useCallback } from "react";
import {
  GeneratorState,
  GeneratorAction,
  Persona,
  DifyPersonaCandidate,
  BusinessIdea,
  CanvasData,
} from "@/types";

const initialState: GeneratorState = {
  currentStep: 0,
  steps: [
    { id: "welcome", title: "Welcome", subtitle: "はじめに", completed: false },
    {
      id: "persona",
      title: "Persona",
      subtitle: "ペルソナ設定",
      completed: false,
    },
    {
      id: "idea",
      title: "Business Idea",
      subtitle: "ビジネスアイデア",
      completed: false,
    },
    { id: "details", title: "Details", subtitle: "詳細設定", completed: false },
    {
      id: "name",
      title: "Business Name",
      subtitle: "ビジネス名",
      completed: false,
    },
    {
      id: "canvas",
      title: "Lean Canvas",
      subtitle: "リーンキャンバス",
      completed: false,
    },
  ],
  persona: null,
  personaCandidates: [],
  businessIdea: null,
  canvasData: null,
  isLoading: false,
  error: null,
};

// エラー情報の型定義
interface ApiError {
  message: string;
  isTemporary: boolean;
  details?: string;
  fallbackUsed?: boolean;
}

// APIレスポンスの型定義
interface ApiResponse {
  persona?: Persona;
  personaCandidates?: DifyPersonaCandidate[];
  businessIdea?: BusinessIdea;
  canvasData?: CanvasData;
  fallbackUsed?: boolean;
  error?: string;
  isTemporary?: boolean;
  details?: string;
}

function generatorReducer(
  state: GeneratorState,
  action: GeneratorAction
): GeneratorState {
  switch (action.type) {
    case "SET_STEP":
      return {
        ...state,
        currentStep: action.payload,
      };

    case "SET_PERSONA":
      return {
        ...state,
        persona: action.payload,
      };

    case "SET_PERSONA_CANDIDATES":
      return {
        ...state,
        personaCandidates: action.payload,
      };

    case "SET_BUSINESS_IDEA":
      return {
        ...state,
        businessIdea: action.payload,
      };

    case "SET_CANVAS_DATA":
      return {
        ...state,
        canvasData: action.payload,
      };

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      };

    case "COMPLETE_STEP":
      return {
        ...state,
        steps: state.steps.map((step, index) =>
          index === action.payload ? { ...step, completed: true } : step
        ),
      };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

export function useGeneratorState() {
  const [state, dispatch] = useReducer(generatorReducer, initialState);

  const setStep = useCallback((step: number) => {
    dispatch({ type: "SET_STEP", payload: step });
  }, []);

  const nextStep = useCallback(() => {
    if (state.currentStep < state.steps.length - 1) {
      dispatch({ type: "COMPLETE_STEP", payload: state.currentStep });
      dispatch({ type: "SET_STEP", payload: state.currentStep + 1 });
    }
  }, [state.currentStep, state.steps.length]);

  const prevStep = useCallback(() => {
    if (state.currentStep > 0) {
      dispatch({ type: "SET_STEP", payload: state.currentStep - 1 });
    }
  }, [state.currentStep]);

  const setPersona = useCallback((persona: Persona) => {
    dispatch({ type: "SET_PERSONA", payload: persona });
  }, []);

  const setPersonaCandidates = useCallback(
    (candidates: DifyPersonaCandidate[]) => {
      dispatch({ type: "SET_PERSONA_CANDIDATES", payload: candidates });
    },
    []
  );

  const setBusinessIdea = useCallback((businessIdea: BusinessIdea) => {
    dispatch({ type: "SET_BUSINESS_IDEA", payload: businessIdea });
  }, []);

  const setCanvasData = useCallback((canvasData: CanvasData) => {
    dispatch({ type: "SET_CANVAS_DATA", payload: canvasData });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: "SET_ERROR", payload: error });
  }, []);

  // API呼び出し共通処理
  const makeApiCall = useCallback(
    async (action: string, data: any): Promise<ApiResponse> => {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          data,
        }),
      });

      const result: ApiResponse = await response.json();

      if (!response.ok) {
        const error: ApiError = {
          message: result.error || "エラーが発生しました",
          isTemporary: result.isTemporary || false,
          details: result.details,
          fallbackUsed: result.fallbackUsed,
        };
        throw error;
      }

      return result;
    },
    []
  );

  // リトライ付きAPI呼び出し
  const makeApiCallWithRetry = useCallback(
    async (
      action: string,
      data: any,
      maxRetries: number = 2
    ): Promise<ApiResponse> => {
      let lastError: ApiError | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          console.log(`${action} - Attempt ${attempt + 1}/${maxRetries + 1}`);
          const result = await makeApiCall(action, data);

          // フォールバックが使用された場合は警告を表示
          if (result.fallbackUsed) {
            setError(
              `AIサービスが利用できないため、サンプルデータを表示しています。`
            );
          }

          return result;
        } catch (error) {
          lastError = error as ApiError;
          console.error(`${action} - Attempt ${attempt + 1} failed:`, error);

          // 最後の試行または非リトライ可能エラーの場合は即座に失敗
          if (attempt === maxRetries || !lastError.isTemporary) {
            break;
          }

          // リトライ前の待機時間
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
          console.log(`${action} - Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }

      throw lastError;
    },
    [makeApiCall, setError]
  );

  const generatePersonaCandidates = useCallback(
    async (initialInput: string) => {
      setLoading(true);
      setError(null);

      try {
        const result = await makeApiCallWithRetry(
          "generate_persona_candidates",
          {
            initialInput,
          }
        );

        if (result.personaCandidates) {
          setPersonaCandidates(result.personaCandidates);
          // 候補が生成されたら、次のステップには進まずにユーザーの選択を待つ
        } else {
          throw new Error("ペルソナ候補の生成に失敗しました");
        }
      } catch (error) {
        const apiError = error as ApiError;
        let errorMessage = apiError.message;

        if (apiError.isTemporary) {
          errorMessage +=
            " しばらく待ってから「再試行」ボタンをクリックしてください。";
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [makeApiCallWithRetry, setPersonaCandidates, setLoading, setError]
  );

  // ペルソナ候補からペルソナを選択する関数
  const selectPersona = useCallback(
    (candidate: DifyPersonaCandidate) => {
      // DifyClientのconvertPersonaCandidateToPersonaメソッドと同様の変換ロジック
      const ageMatch = candidate.description.match(/(\d+)代/);
      const occupationMatch = candidate.description.match(/、([^、]+)、年収/);

      const age = ageMatch ? parseInt(ageMatch[1]) * 10 + 5 : undefined;
      const occupation = occupationMatch ? occupationMatch[1] : "職業未設定";
      const name = `ペルソナ${candidate.id}`;

      const persona: Persona = {
        name,
        age,
        occupation,
        painPoints: [candidate.needs.explicit],
        goals: [candidate.needs.implicit],
        behaviors: ["情報収集行動", "意思決定パターン", "購買行動"],
      };

      setPersona(persona);
      nextStep();
    },
    [setPersona, nextStep]
  );

  // 後方互換性のためのgeneratePersonaメソッド
  const generatePersona = useCallback(
    async (initialInput: string) => {
      setLoading(true);
      setError(null);

      try {
        const result = await makeApiCallWithRetry("generate_persona", {
          initialInput,
        });

        if (result.persona) {
          setPersona(result.persona);
          nextStep();
        } else {
          throw new Error("ペルソナの生成に失敗しました");
        }
      } catch (error) {
        const apiError = error as ApiError;
        let errorMessage = apiError.message;

        if (apiError.isTemporary) {
          errorMessage +=
            " しばらく待ってから「再試行」ボタンをクリックしてください。";
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [makeApiCallWithRetry, nextStep, setPersona, setLoading, setError]
  );

  const refineBusinessIdea = useCallback(
    async (initialIdea: string) => {
      if (!state.persona) {
        setError("ペルソナが必要です。前のステップに戻って設定してください。");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await makeApiCallWithRetry("refine_business_idea", {
          persona: state.persona,
          initialIdea,
        });

        if (result.businessIdea) {
          setBusinessIdea(result.businessIdea);
          nextStep();
        } else {
          throw new Error("ビジネスアイデアの詳細化に失敗しました");
        }
      } catch (error) {
        const apiError = error as ApiError;
        let errorMessage = apiError.message;

        if (apiError.isTemporary) {
          errorMessage +=
            " しばらく待ってから「再試行」ボタンをクリックしてください。";
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [
      state.persona,
      makeApiCallWithRetry,
      nextStep,
      setBusinessIdea,
      setLoading,
      setError,
    ]
  );

  const generateCanvas = useCallback(async () => {
    if (!state.persona || !state.businessIdea) {
      setError(
        "ペルソナとビジネスアイデアの両方が必要です。前のステップに戻って設定してください。"
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await makeApiCallWithRetry("generate_canvas", {
        persona: state.persona,
        businessIdea: state.businessIdea,
      });

      if (result.canvasData) {
        setCanvasData(result.canvasData);
        nextStep();
      } else {
        throw new Error("リーンキャンバスの生成に失敗しました");
      }
    } catch (error) {
      const apiError = error as ApiError;
      let errorMessage = apiError.message;

      if (apiError.isTemporary) {
        errorMessage +=
          " しばらく待ってから「再試行」ボタンをクリックしてください。";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [
    state.persona,
    state.businessIdea,
    makeApiCallWithRetry,
    nextStep,
    setCanvasData,
    setLoading,
    setError,
  ]);

  // リトライ機能
  const retryCurrentOperation = useCallback(
    async (initialInput?: string, initialIdea?: string) => {
      switch (state.currentStep) {
        case 1: // ペルソナ候補生成
          if (initialInput) {
            await generatePersonaCandidates(initialInput);
          }
          break;
        case 2: // ビジネスアイデア詳細化
          if (initialIdea) {
            await refineBusinessIdea(initialIdea);
          }
          break;
        case 5: // キャンバス生成
          await generateCanvas();
          break;
        default:
          console.warn("Current step does not support retry");
      }
    },
    [
      state.currentStep,
      generatePersonaCandidates,
      refineBusinessIdea,
      generateCanvas,
    ]
  );

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  return {
    state,
    actions: {
      setStep,
      nextStep,
      prevStep,
      setPersona,
      setPersonaCandidates,
      setBusinessIdea,
      setCanvasData,
      setLoading,
      setError,
      generatePersona,
      generatePersonaCandidates,
      selectPersona,
      refineBusinessIdea,
      generateCanvas,
      retryCurrentOperation,
      reset,
    },
  };
}
