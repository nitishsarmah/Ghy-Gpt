import { AttachedFile, NewsMode } from "../types";
import { structureNews } from "../utils/newsEngine";

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

/**
 * GHY GPT OFFLINE ENGINE
 *
 * No Gemini
 * No Render
 * No API
 * No internet request
 *
 * All newsroom processing happens locally on the device.
 */

export async function requestNewsGeneration(
  payload: GenerateRequestPayload
): Promise<string> {
  const prompt = payload.prompt?.trim();

  if (!prompt) {
    throw new Error("Please enter some news information.");
  }

  const result = structureNews(prompt, "standard");

  return result.fullText;
}

/**
 * Image generation is not available in offline mode.
 */
export async function requestNewsImage(): Promise<never> {
  throw new Error(
    "Image generation is unavailable in Offline Mode."
  );
}

/**
 * Always reports local/offline status.
 */
export async function checkServerHealth(): Promise<{
  status: string;
  hasApiKey: boolean;
}> {
  return {
    status: "offline",
    hasApiKey: false,
  };
}
