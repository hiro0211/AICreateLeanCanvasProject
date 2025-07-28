import { NextRequest, NextResponse } from "next/server";
import { DifyClient } from "@/lib/dify-client";
import { Persona, BusinessIdea, DifyPersonaCandidate } from "@/types";

const difyClient = new DifyClient(
  process.env.DIFY_BASE_URL || "https://api.dify.ai",
  process.env.DIFY_API_KEY || ""
);

// エラーメッセージをユーザーフレンドリーに変換
function getErrorMessage(error: any): {
  message: string;
  isTemporary: boolean;
} {
  const errorMessage = error instanceof Error ? error.message : String(error);

  // タイムアウトエラー
  if (
    errorMessage.includes("タイムアウト") ||
    errorMessage.includes("timeout")
  ) {
    return {
      message:
        "AIサービスの応答に時間がかかっています。しばらく待ってから再度お試しください。",
      isTemporary: true,
    };
  }

  // 504 Gateway Time-out
  if (
    errorMessage.includes("504") ||
    errorMessage.includes("Gateway Time-out")
  ) {
    return {
      message:
        "AIサービスが一時的に利用できません。数分後に再度お試しください。",
      isTemporary: true,
    };
  }

  // 503 Service Unavailable
  if (
    errorMessage.includes("503") ||
    errorMessage.includes("Service Unavailable")
  ) {
    return {
      message:
        "AIサービスがメンテナンス中です。しばらく待ってから再度お試しください。",
      isTemporary: true,
    };
  }

  // 429 Too Many Requests
  if (
    errorMessage.includes("429") ||
    errorMessage.includes("Too Many Requests")
  ) {
    return {
      message: "リクエストが多すぎます。しばらく待ってから再度お試しください。",
      isTemporary: true,
    };
  }

  // 401 Unauthorized
  if (errorMessage.includes("401") || errorMessage.includes("Unauthorized")) {
    return {
      message: "AI サービスの認証に失敗しました。管理者に連絡してください。",
      isTemporary: false,
    };
  }

  // ネットワークエラー
  if (
    errorMessage.includes("ECONNRESET") ||
    errorMessage.includes("ENOTFOUND") ||
    errorMessage.includes("network")
  ) {
    return {
      message:
        "ネットワーク接続に問題があります。インターネット接続を確認してください。",
      isTemporary: true,
    };
  }

  // 5xx サーバーエラー
  if (errorMessage.includes("5")) {
    return {
      message:
        "AIサービスで一時的な問題が発生しています。しばらく待ってから再度お試しください。",
      isTemporary: true,
    };
  }

  // その他のエラー
  return {
    message:
      "予期しないエラーが発生しました。問題が続く場合は管理者に連絡してください。",
    isTemporary: false,
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log("API Route called with request:", {
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
    });

    const requestBody = await request.json();
    console.log("Request body:", requestBody);

    const { action, data } = requestBody;

    // 環境変数の詳細チェック
    console.log("Environment check:", {
      DIFY_API_KEY: process.env.DIFY_API_KEY ? "Set" : "Not set",
      DIFY_BASE_URL: process.env.DIFY_BASE_URL || "Using default",
      NODE_ENV: process.env.NODE_ENV,
    });

    if (!process.env.DIFY_API_KEY) {
      console.error("Dify API key is not configured");
      return NextResponse.json(
        {
          error:
            "AI サービスの設定が完了していません。管理者に連絡してください。",
          details:
            "Environment variables must be configured for the API to work properly",
          isTemporary: false,
        },
        { status: 500 }
      );
    }

    switch (action) {
      case "generate_persona": {
        const { initialInput } = data;
        if (!initialInput) {
          return NextResponse.json(
            { error: "ビジネスアイデアの入力が必要です。", isTemporary: false },
            { status: 400 }
          );
        }

        try {
          const persona = await difyClient.generatePersona(initialInput);
          return NextResponse.json({
            persona,
            fallbackUsed: persona.name === "サンプルペルソナ",
          });
        } catch (error) {
          const errorInfo = getErrorMessage(error);
          console.error("Persona generation error:", error);

          return NextResponse.json(
            {
              error: errorInfo.message,
              isTemporary: errorInfo.isTemporary,
              details: error instanceof Error ? error.message : String(error),
            },
            { status: errorInfo.isTemporary ? 503 : 500 }
          );
        }
      }

      case "generate_persona_candidates": {
        const { initialInput } = data;
        if (!initialInput) {
          return NextResponse.json(
            { error: "ビジネスアイデアの入力が必要です。", isTemporary: false },
            { status: 400 }
          );
        }

        try {
          const personaCandidates = await difyClient.generatePersonaCandidates(initialInput);
          return NextResponse.json({
            personaCandidates,
            fallbackUsed: personaCandidates.length > 0 && personaCandidates[0].id === 1,
          });
        } catch (error) {
          const errorInfo = getErrorMessage(error);
          console.error("Persona candidates generation error:", error);

          return NextResponse.json(
            {
              error: errorInfo.message,
              isTemporary: errorInfo.isTemporary,
              details: error instanceof Error ? error.message : String(error),
            },
            { status: errorInfo.isTemporary ? 503 : 500 }
          );
        }
      }

      case "refine_business_idea": {
        const {
          persona,
          initialIdea,
        }: { persona: Persona; initialIdea: string } = data;
        if (!persona || !initialIdea) {
          return NextResponse.json(
            {
              error: "ペルソナと初期アイデアの両方が必要です。",
              isTemporary: false,
            },
            { status: 400 }
          );
        }

        try {
          const businessIdea = await difyClient.refineBusinessIdea(
            persona,
            initialIdea
          );
          return NextResponse.json({
            businessIdea,
            fallbackUsed:
              businessIdea.concept.includes("革新的なソリューション"),
          });
        } catch (error) {
          const errorInfo = getErrorMessage(error);
          console.error("Business idea refinement error:", error);

          return NextResponse.json(
            {
              error: errorInfo.message,
              isTemporary: errorInfo.isTemporary,
              details: error instanceof Error ? error.message : String(error),
            },
            { status: errorInfo.isTemporary ? 503 : 500 }
          );
        }
      }

      case "generate_canvas": {
        const {
          persona,
          businessIdea,
        }: { persona: Persona; businessIdea: BusinessIdea } = data;
        if (!persona || !businessIdea) {
          return NextResponse.json(
            {
              error: "ペルソナとビジネスアイデアの両方が必要です。",
              isTemporary: false,
            },
            { status: 400 }
          );
        }

        try {
          const canvasData = await difyClient.generateCanvas(
            persona,
            businessIdea
          );
          return NextResponse.json({
            canvasData,
            fallbackUsed:
              canvasData.problem.includes("既存ソリューションの使いにくさ"),
          });
        } catch (error) {
          const errorInfo = getErrorMessage(error);
          console.error("Canvas generation error:", error);

          return NextResponse.json(
            {
              error: errorInfo.message,
              isTemporary: errorInfo.isTemporary,
              details: error instanceof Error ? error.message : String(error),
            },
            { status: errorInfo.isTemporary ? 503 : 500 }
          );
        }
      }

      default:
        return NextResponse.json(
          { error: "無効なアクションです。", isTemporary: false },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("API error:", error);
    const errorInfo = getErrorMessage(error);

    return NextResponse.json(
      {
        error: errorInfo.message,
        isTemporary: errorInfo.isTemporary,
        details: error instanceof Error ? error.message : String(error),
      },
      { status: errorInfo.isTemporary ? 503 : 500 }
    );
  }
}
