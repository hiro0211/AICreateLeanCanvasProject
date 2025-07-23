import {
  DifyApiRequest,
  DifyApiResponse,
  Persona,
  BusinessIdea,
  CanvasData,
} from "@/types";

export class DifyClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async generateCanvas(
    persona: Persona,
    businessIdea: BusinessIdea
  ): Promise<CanvasData> {
    const requestData: DifyApiRequest = {
      inputs: {
        persona,
        businessIdea,
        step: "generate_canvas",
      },
      response_mode: "blocking",
      user: `user_${Date.now()}`,
    };

    try {
      console.log("Making Dify API request to generate canvas:", {
        url: `${this.baseUrl}/v1/completion-messages`,
        data: requestData,
        hasApiKey: !!this.apiKey,
      });

      const response = await fetch(`${this.baseUrl}/v1/completion-messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

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
        const canvasData = JSON.parse(data.answer) as CanvasData;
        return canvasData;
      } catch (parseError) {
        console.error("Failed to parse Dify response as JSON:", data.answer);
        throw new Error(`Invalid JSON response from Dify API: ${data.answer}`);
      }
    } catch (error) {
      console.error("Dify API call failed:", error);
      throw error;
    }
  }

  async generatePersona(initialInput: string): Promise<Persona> {
    const requestData: DifyApiRequest = {
      inputs: {
        step: "generate_persona",
        businessIdea: {
          concept: initialInput,
          targetMarket: "",
          uniqueValue: "",
          revenueModel: "",
        },
      },
      response_mode: "blocking",
      user: `user_${Date.now()}`,
    };

    try {
      console.log("Making Dify API request to generate persona:", {
        url: `${this.baseUrl}/v1/completion-messages`,
        data: requestData,
        hasApiKey: !!this.apiKey,
      });

      const response = await fetch(`${this.baseUrl}/v1/completion-messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

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
        const persona = JSON.parse(data.answer) as Persona;
        return persona;
      } catch (parseError) {
        console.error("Failed to parse Dify response as JSON:", data.answer);
        throw new Error(`Invalid JSON response from Dify API: ${data.answer}`);
      }
    } catch (error) {
      console.error("Dify API call failed:", error);
      throw error;
    }
  }

  async refineBusinessIdea(
    persona: Persona,
    initialIdea: string
  ): Promise<BusinessIdea> {
    const requestData: DifyApiRequest = {
      inputs: {
        persona,
        step: "refine_business_idea",
        businessIdea: {
          concept: initialIdea,
          targetMarket: "",
          uniqueValue: "",
          revenueModel: "",
        },
      },
      response_mode: "blocking",
      user: `user_${Date.now()}`,
    };

    try {
      console.log("Making Dify API request to refine business idea:", {
        url: `${this.baseUrl}/v1/completion-messages`,
        data: requestData,
        hasApiKey: !!this.apiKey,
      });

      const response = await fetch(`${this.baseUrl}/v1/completion-messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

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
        const businessIdea = JSON.parse(data.answer) as BusinessIdea;
        return businessIdea;
      } catch (parseError) {
        console.error("Failed to parse Dify response as JSON:", data.answer);
        throw new Error(`Invalid JSON response from Dify API: ${data.answer}`);
      }
    } catch (error) {
      console.error("Dify API call failed:", error);
      throw error;
    }
  }
}
