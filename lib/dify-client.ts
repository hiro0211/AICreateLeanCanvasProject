import {
  DifyApiRequest,
  DifyApiResponse,
  DifyPersonaResponse,
  DifyPersonaCandidate,
  Persona,
  BusinessIdea,
  CanvasData,
} from "@/types";

// リトライ設定
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  timeoutMs: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1秒
  maxDelay: 10000, // 10秒
  timeoutMs: 60000, // 60秒
};

export class DifyClient {
  private baseUrl: string;
  private apiKey: string;
  private retryConfig: RetryConfig;

  constructor(
    baseUrl: string,
    apiKey: string,
    retryConfig?: Partial<RetryConfig>
  ) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  }

  // エラーが一時的かどうかを判定
  private isRetryableError(error: any): boolean {
    if (error.name === "AbortError") return false; // タイムアウトはリトライしない

    // HTTPエラーの場合
    if (error.message && typeof error.message === "string") {
      const statusMatch = error.message.match(/Dify API error: (\d+)/);
      if (statusMatch) {
        const status = parseInt(statusMatch[1]);
        // 5xx エラー（サーバーエラー）、408（タイムアウト）、429（レート制限）はリトライ対象
        return status >= 500 || status === 408 || status === 429;
      }
    }

    // ネットワークエラーの場合
    if (
      error.code === "ECONNRESET" ||
      error.code === "ENOTFOUND" ||
      error.code === "ETIMEDOUT"
    ) {
      return true;
    }

    return false;
  }

  // 指数バックオフでのスリープ
  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // リトライ付きAPI呼び出し
  private async apiCallWithRetry<T>(
    apiCall: () => Promise<T>,
    operation: string
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        console.log(
          `${operation} - Attempt ${attempt + 1}/${
            this.retryConfig.maxRetries + 1
          }`
        );
        return await apiCall();
      } catch (error) {
        lastError = error;
        console.error(`${operation} - Attempt ${attempt + 1} failed:`, error);

        // 最後の試行または非リトライ可能エラーの場合は即座に失敗
        if (
          attempt === this.retryConfig.maxRetries ||
          !this.isRetryableError(error)
        ) {
          break;
        }

        // 指数バックオフでリトライ
        const delay = Math.min(
          this.retryConfig.baseDelay * Math.pow(2, attempt),
          this.retryConfig.maxDelay
        );
        console.log(`${operation} - Retrying in ${delay}ms...`);
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  // タイムアウト付きfetch
  private async fetchWithTimeout(
    url: string,
    options: RequestInit
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      this.retryConfig.timeoutMs
    );

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(
          `リクエストがタイムアウトしました (${this.retryConfig.timeoutMs}ms)`
        );
      }
      throw error;
    }
  }

  private extractJsonFromResponse(response: string): string {
    // JSONの開始と終了を見つける
    const jsonStart = response.indexOf("{");
    const jsonEnd = response.lastIndexOf("}");

    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      return response.substring(jsonStart, jsonEnd + 1);
    }

    // 配列形式の場合
    const arrayStart = response.indexOf("[");
    const arrayEnd = response.lastIndexOf("]");

    if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
      return response.substring(arrayStart, arrayEnd + 1);
    }

    return response;
  }

  private convertDifyPersonaToAppPersona(difyResponse: any): Persona {
    // 配列形式の場合は最初の要素を使用
    const personaData = Array.isArray(difyResponse)
      ? difyResponse[0]
      : difyResponse;

    // 直接Persona形式の場合
    if (personaData.name && personaData.painPoints) {
      return personaData as Persona;
    }

    // Difyの独自形式の場合は変換
    if (personaData.ペルソナ && Array.isArray(personaData.ペルソナ)) {
      const personaInfo = personaData.ペルソナ;

      // 氏名、年齢、職業を抽出
      const nameInfo = personaInfo.find((item: string) =>
        item.includes("氏名:")
      );
      const ageInfo = personaInfo.find((item: string) =>
        item.includes("年齢:")
      );
      const occupationInfo = personaInfo.find((item: string) =>
        item.includes("職業:")
      );

      const name = nameInfo ? nameInfo.split(":")[1]?.trim() : "未設定";
      const age = ageInfo
        ? parseInt(ageInfo.match(/\d+/)?.[0] || "0")
        : undefined;
      const occupation = occupationInfo
        ? occupationInfo.split(":")[1]?.trim()
        : "未設定";

      return {
        name,
        age,
        occupation,
        painPoints: [personaData.顕在ニーズ || "課題が設定されていません"],
        goals: [personaData.潜在ニーズ || "目標が設定されていません"],
        behaviors: ["情報収集行動", "意思決定パターン", "購買行動"],
      };
    }

    // フォールバック
    return {
      name: "サンプルペルソナ",
      age: 30,
      occupation: "会社員",
      painPoints: ["業務の非効率性", "時間不足", "ストレス"],
      goals: ["効率化の実現", "ワークライフバランス", "スキルアップ"],
      behaviors: ["積極的な情報収集", "慎重な意思決定", "品質重視の選択"],
    };
  }

  // フォールバックペルソナ候補データ生成関数
  private generateFallbackPersonaCandidates(): DifyPersonaCandidate[] {
    return [
      {
        id: 1,
        description:
          "30代女性、都市部在住、IT企業のプロジェクトマネージャー、年収700万円、趣味はヨガと料理、夫と幼児2人の4人家族",
        needs: {
          explicit: "仕事と家庭の両立を効率的に行いたい",
          implicit: "ストレスを軽減し自己成長できる環境を求めている",
        },
      },
      {
        id: 2,
        description:
          "50代男性、地方在住、製造業の現場監督、年収500万円、趣味は釣りとDIY、妻と高校生の子供2人の4人家族",
        needs: {
          explicit: "現場作業の安全性と効率を向上させたい",
          implicit: "地域社会とのつながりや安心感を重視している",
        },
      },
      {
        id: 3,
        description:
          "20代男性、都市部在住、フリーランスのグラフィックデザイナー、年収400万円、趣味はゲームとカフェ巡り、独身",
        needs: {
          explicit: "効率的なスケジュール管理ツールを探している",
          implicit: "クリエイティブな刺激やコミュニティを求めている",
        },
      },
      {
        id: 4,
        description:
          "40代女性、都市部在住、教育関係の公務員、年収600万円、趣味は読書とランニング、夫と中学生の子供1人の3人家族",
        needs: {
          explicit: "教育現場でのIT活用を推進したい",
          implicit: "仕事のやりがいと家庭の安定を両立したい",
        },
      },
      {
        id: 5,
        description:
          "60代男性、地方在住、退職者、年金生活、趣味は園芸と囲碁、妻と二人暮らし",
        needs: {
          explicit: "健康維持のための簡単な運動プログラムを探している",
          implicit: "社会参加や生きがいを感じたい",
        },
      },
      {
        id: 6,
        description:
          "10代女性、都市部在住、高校生、趣味はSNSとファッション、両親と3人暮らし",
        needs: {
          explicit: "学校生活や進学情報を効率よく得たい",
          implicit: "自己表現や友人関係の充実を求めている",
        },
      },
      {
        id: 7,
        description:
          "70代女性、地方在住、一人暮らし、年金生活、趣味は手芸と地域のボランティア活動",
        needs: {
          explicit:
            "日常生活の買い物や健康管理をサポートするサービスを探している",
          implicit: "孤独感の解消や安心感を求めている",
        },
      },
      {
        id: 8,
        description:
          "30代男性、都市部在住、スタートアップ企業経営者、年収1000万円、趣味はランニングと読書、独身",
        needs: {
          explicit: "効率的な資金調達や人材採用の方法を知りたい",
          implicit: "事業成功のためのネットワーク拡大や自己成長を望んでいる",
        },
      },
      {
        id: 9,
        description:
          "40代男性、地方在住、農業従事者、年収300万円、趣味は釣りと地元祭り参加、妻と子供2人の4人家族",
        needs: {
          explicit: "農作業の効率化と販路拡大を図りたい",
          implicit: "地域コミュニティの活性化や子供の将来を見据えている",
        },
      },
      {
        id: 10,
        description:
          "20代女性、都市部在住、大学生、アルバイト収入あり、趣味は音楽鑑賞と旅行、一人暮らし",
        needs: {
          explicit: "学業とアルバイトの両立を支援する情報を探している",
          implicit: "将来のキャリア形成や自己実現を目指している",
        },
      },
    ];
  }

  // フォールバックデータ生成関数
  private generateFallbackCanvasData(
    persona: Persona,
    businessIdea: BusinessIdea
  ): CanvasData {
    return {
      problem: [
        "既存ソリューションの使いにくさ",
        "効率性の低さ",
        "コストの高さ",
      ],
      solution: [
        businessIdea.concept || "革新的なソリューション",
        "ユーザーフレンドリーなインターフェース",
        "コスト効率的なアプローチ",
      ],
      keyMetrics: ["ユーザー獲得数", "顧客満足度", "月次収益"],
      uniqueValueProposition: [
        businessIdea.uniqueValue || "独自の価値提案",
        "競合との差別化",
      ],
      unfairAdvantage: ["技術的優位性", "先行者利益"],
      channels: ["Webサイト", "SNSマーケティング", "パートナー連携"],
      customerSegments: [
        persona.occupation || "ターゲット職業",
        businessIdea.targetMarket || "主要顧客層",
      ],
      costStructure: ["開発コスト", "マーケティング費用", "運営費"],
      revenueStreams: [
        businessIdea.revenueModel || "サブスクリプション",
        "追加サービス",
      ],
    };
  }

  private generateFallbackBusinessIdea(
    persona: Persona,
    initialIdea: string
  ): BusinessIdea {
    return {
      concept: `${initialIdea}を基にした、${persona.occupation}向けの革新的なソリューション`,
      targetMarket: `${persona.occupation}を中心とした専門職市場`,
      uniqueValue: "業界特有の課題を解決する専門性の高いアプローチ",
      revenueModel: "サブスクリプション型の月額課金モデル",
    };
  }

  async generateCanvas(
    persona: Persona,
    businessIdea: BusinessIdea
  ): Promise<CanvasData> {
    const requestData = {
      inputs: {
        persona: JSON.stringify(persona),
        businessIdea: JSON.stringify(businessIdea),
      },
      query:
        '以下のペルソナとビジネスアイデアに基づいて、リーンキャンバスを生成してください。以下のJSON構造で、JSONオブジェクトのみを出力してください。JSON以外のテキスト、説明文、マークダウンの囲みは絶対に含めないでください。\n\n{\n  "problem": ["問題1", "問題2", "問題3"],\n  "solution": ["解決策1", "解決策2", "解決策3"],\n  "keyMetrics": ["指標1", "指標2", "指標3"],\n  "uniqueValueProposition": ["価値提案1", "価値提案2"],\n  "unfairAdvantage": ["競合優位性1", "競合優位性2"],\n  "channels": ["販売チャネル1", "販売チャネル2", "販売チャネル3"],\n  "customerSegments": ["顧客セグメント1", "顧客セグメント2"],\n  "costStructure": ["コスト項目1", "コスト項目2", "コスト項目3"],\n  "revenueStreams": ["収益源1", "収益源2"]\n}',
      response_mode: "blocking",
      user: `user_${Date.now()}`,
    };

    return this.apiCallWithRetry(async () => {
      console.log("Making Dify API request to generate canvas:", {
        url: `${this.baseUrl}/v1/chat-messages`,
        data: requestData,
        hasApiKey: !!this.apiKey,
      });

      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/v1/chat-messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      console.log(
        "Dify API response status:",
        response.status,
        response.statusText
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Dify API error response:", errorText);
        throw new Error(
          `Dify API error: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data: DifyApiResponse = await response.json();
      console.log("Dify API response data:", data);

      try {
        const cleanedResponse = this.extractJsonFromResponse(data.answer);
        const canvasData = JSON.parse(cleanedResponse) as CanvasData;
        return canvasData;
      } catch (parseError) {
        console.error("Failed to parse Dify response as JSON:", data.answer);
        console.warn("Using fallback canvas data due to parse error");
        return this.generateFallbackCanvasData(persona, businessIdea);
      }
    }, "Generate Canvas").catch((error) => {
      console.warn(
        "All canvas generation attempts failed, using fallback data"
      );
      return this.generateFallbackCanvasData(persona, businessIdea);
    });
  }

  async generatePersonaCandidates(
    initialInput: string
  ): Promise<DifyPersonaCandidate[]> {
    const requestData = {
      inputs: {
        concept: initialInput,
      },
      query:
        '以下のビジネスコンセプトに基づいて、ターゲット顧客のペルソナ候補を10個生成してください。以下のJSON構造で、JSONオブジェクトのみを出力してください。JSON以外のテキスト、説明文、マークダウンの囲みは絶対に含めないでください。\n\n{\n  "personas": [\n    {\n      "id": 1,\n      "description": "ペルソナの属性をまとめた説明文（年齢、性別、居住地、職業、年収、趣味、家族構成など）",\n      "needs": {\n        "explicit": "顕在ニーズ（明確に認識している課題やニーズ）",\n        "implicit": "潜在ニーズ（無意識的に感じている課題やニーズ）"\n      }\n    }\n  ]\n}',
      response_mode: "blocking",
      user: `user_${Date.now()}`,
    };

    return this.apiCallWithRetry(async () => {
      console.log("Making Dify API request to generate persona candidates:", {
        url: `${this.baseUrl}/v1/chat-messages`,
        data: requestData,
        hasApiKey: !!this.apiKey,
      });

      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/v1/chat-messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      console.log(
        "Dify API response status:",
        response.status,
        response.statusText
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Dify API error response:", errorText);
        throw new Error(
          `Dify API error: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data: DifyApiResponse = await response.json();
      console.log("Dify API response data:", data);

      try {
        const cleanedResponse = this.extractJsonFromResponse(data.answer);
        const parsedResponse: DifyPersonaResponse = JSON.parse(cleanedResponse);
        return parsedResponse.personas;
      } catch (parseError) {
        console.error("Failed to parse Dify response as JSON:", data.answer);
        console.error("Parse error:", parseError);

        // フォールバック候補を返す
        return this.generateFallbackPersonaCandidates();
      }
    }, "Generate Persona Candidates").catch((error) => {
      console.warn(
        "All persona candidate generation attempts failed, using fallback data"
      );
      return this.generateFallbackPersonaCandidates();
    });
  }

  // DifyPersonaCandidateからPersonaに変換するヘルパーメソッド
  convertPersonaCandidateToPersona(candidate: DifyPersonaCandidate): Persona {
    // description から基本情報を抽出する簡単なパターンマッチング
    const ageMatch = candidate.description.match(/(\d+)代/);
    const occupationMatch = candidate.description.match(/、([^、]+)、年収/);

    const age = ageMatch ? parseInt(ageMatch[1]) * 10 + 5 : undefined; // 30代 -> 35歳として概算
    const occupation = occupationMatch ? occupationMatch[1] : "職業未設定";

    // 名前は適当に生成（実際のアプリでは選択時にユーザーが設定することを想定）
    const name = `ペルソナ${candidate.id}`;

    return {
      name,
      age,
      occupation,
      painPoints: [candidate.needs.explicit],
      goals: [candidate.needs.implicit],
      behaviors: ["情報収集行動", "意思決定パターン", "購買行動"], // デフォルト値
    };
  }

  // 後方互換性のための既存のgeneratePersonaメソッド（最初の候補を返す）
  async generatePersona(initialInput: string): Promise<Persona> {
    const candidates = await this.generatePersonaCandidates(initialInput);
    return this.convertPersonaCandidateToPersona(candidates[0]);
  }

  async refineBusinessIdea(
    persona: Persona,
    initialIdea: string
  ): Promise<BusinessIdea> {
    const requestData = {
      inputs: {
        persona: JSON.stringify(persona),
        initialIdea: initialIdea,
      },
      query:
        '以下のペルソナと初期アイデアに基づいて、ビジネスアイデアを詳細化してください。以下のJSON構造で、JSONオブジェクトのみを出力してください。JSON以外のテキスト、説明文、マークダウンの囲みは絶対に含めないでください。\n\n{\n  "concept": "ビジネスコンセプトの詳細説明",\n  "targetMarket": "具体的なターゲット市場の説明",\n  "uniqueValue": "独自の価値提案",\n  "revenueModel": "収益モデルの説明"\n}',
      response_mode: "blocking",
      user: `user_${Date.now()}`,
    };

    return this.apiCallWithRetry(async () => {
      console.log("Making Dify API request to refine business idea:", {
        url: `${this.baseUrl}/v1/chat-messages`,
        data: requestData,
        hasApiKey: !!this.apiKey,
      });

      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/v1/chat-messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      console.log(
        "Dify API response status:",
        response.status,
        response.statusText
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Dify API error response:", errorText);
        throw new Error(
          `Dify API error: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data: DifyApiResponse = await response.json();
      console.log("Dify API response data:", data);

      try {
        const cleanedResponse = this.extractJsonFromResponse(data.answer);
        const businessIdea = JSON.parse(cleanedResponse) as BusinessIdea;
        return businessIdea;
      } catch (parseError) {
        console.error("Failed to parse Dify response as JSON:", data.answer);
        console.warn("Using fallback business idea due to parse error");
        return this.generateFallbackBusinessIdea(persona, initialIdea);
      }
    }, "Refine Business Idea").catch((error) => {
      console.warn(
        "All business idea refinement attempts failed, using fallback data"
      );
      return this.generateFallbackBusinessIdea(persona, initialIdea);
    });
  }
}
