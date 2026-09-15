import {
  AttachedFile,
  GeneratedImageMetadata,
  NewsMode,
} from "../types";

const API_BASE_URL = "https://ghy-gpt.onrender.com";

export interface GenerateRequestPayload {
  prompt: string;
  systemInstruction?: string;
  history?: Array<{ role: string; content: string }>;
  mode?: NewsMode;
  temperature?: number;
  uploadedFiles?: AttachedFile[];
}

export interface GenerateResponsePayload {
  text: string;
  mode?: NewsMode;
}

function extractCleanErrorMessage(
  raw: any,
  fallbackStatus?: number
): string {
  if (!raw) {
    return fallbackStatus
      ? `Request failed (status ${fallbackStatus})`
      : "An error occurred";
  }

  let str =
    typeof raw === "string"
      ? raw
      : raw.error || raw.message || JSON.stringify(raw);

  try {
    const jsonMatch = str.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      if (parsed?.error?.message) {
        return parsed.error.message;
      }

      if (parsed?.message) {
        return parsed.message;
      }

      if (typeof parsed?.error === "string") {
        return parsed.error;
      }
    }
  } catch {}

  str = str
    .replace(/^ApiError:\s*/i, "")
    .replace(/^Error:\s*/i, "");

  return str;
}

export async function requestNewsGeneration(
  payload: GenerateRequestPayload
): Promise<string> {
  const response = await fetch(
    `${API_BASE_URL}/api/generate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({}));

    throw new Error(
      extractCleanErrorMessage(
        errorData,
        response.status
      )
    );
  }

  const data: GenerateResponsePayload =
    await response.json();

  return data.text;
}

export async function requestNewsImage(params: {
  prompt: string;
  aspectRatio: string;
  preset: string;
}): Promise<GeneratedImageMetadata> {
  const response = await fetch(
    `${API_BASE_URL}/api/generate-image`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    }
  );

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({}));

    throw new Error(
      extractCleanErrorMessage(
        errorData,
        response.status
      )
    );
  }

  const data = await response.json();

  return {
    imageUrl: data.imageUrl,
    aspectRatio: data.aspectRatio,
    preset: data.preset,
    prompt: data.prompt,
    disclaimer:
      data.disclaimer ||
      "Illustrative AI Image - Not a photograph of actual events",
  };
}

export async function checkServerHealth(): Promise<{
  status: string;
  hasApiKey: boolean;
}> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/health`
    );

    if (!response.ok) {
      return {
        status: "offline",
        hasApiKey: false,
      };
    }

    return await response.json();
  } catch {
    return {
      status: "offline",
      hasApiKey: false,
    };
  }
}
