import { NextRequest, NextResponse } from "next/server";
import { DifyClient } from "@/lib/dify-client";
import { Persona, BusinessIdea } from "@/types";

const difyClient = new DifyClient(
  process.env.DIFY_BASE_URL || "https://api.dify.ai",
  process.env.DIFY_API_KEY || ""
);

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
            "Dify API key is not configured. Please set DIFY_API_KEY in your .env.local file",
          details:
            "Environment variables must be configured for the API to work properly",
        },
        { status: 500 }
      );
    }

    switch (action) {
      case "generate_persona": {
        const { initialInput } = data;
        if (!initialInput) {
          return NextResponse.json(
            { error: "Initial input is required" },
            { status: 400 }
          );
        }

        const persona = await difyClient.generatePersona(initialInput);
        return NextResponse.json({ persona });
      }

      case "refine_business_idea": {
        const {
          persona,
          initialIdea,
        }: { persona: Persona; initialIdea: string } = data;
        if (!persona || !initialIdea) {
          return NextResponse.json(
            { error: "Persona and initial idea are required" },
            { status: 400 }
          );
        }

        const businessIdea = await difyClient.refineBusinessIdea(
          persona,
          initialIdea
        );
        return NextResponse.json({ businessIdea });
      }

      case "generate_canvas": {
        const {
          persona,
          businessIdea,
        }: { persona: Persona; businessIdea: BusinessIdea } = data;
        if (!persona || !businessIdea) {
          return NextResponse.json(
            { error: "Persona and business idea are required" },
            { status: 400 }
          );
        }

        const canvasData = await difyClient.generateCanvas(
          persona,
          businessIdea
        );
        return NextResponse.json({ canvasData });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
