import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";

let client = null;

function getClient() {
  if (!env.gemini.apiKey) {
    throw ApiError.badRequest(
      "AI is not configured. Set GEMINI_API_KEY in the backend .env to enable AI features.",
    );
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey: env.gemini.apiKey });
  }
  return client;
}

function isRetryable(err) {
  const msg = err.message || "";
  return (
    msg.includes('"code":503') ||
    msg.includes("UNAVAILABLE") ||
    msg.includes('"code":429') ||
    msg.includes("RESOURCE_EXHAUSTED")
  );
}

async function callWithFallback(buildRequest) {
  const ai = getClient();
  const models = env.gemini.models;
  let lastErr;

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    try {
      return await ai.models.generateContent(buildRequest(model));
    } catch (err) {
      lastErr = err;
      const hasMoreModels = i < models.length - 1;
      if (isRetryable(err) && hasMoreModels) {
        console.warn(
          `⚠️  ${model} unavailable, falling back to ${models[i + 1]}`,
        );
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

export async function generateJson(prompt, { schemaHint = "" } = {}) {
  const fullPrompt = `${prompt}
${schemaHint ? `Return ONLY valid minimized JSON matching this shape:\n${schemaHint}` : ""}
Do not include markdown code fences or any prose. Output JSON only.`;

  let text;
  try {
    const result = await callWithFallback((model) => ({
      model,
      contents: fullPrompt,
      config: { responseMimeType: "application/json", temperature: 0.7 },
    }));
    text = result.text;
  } catch (err) {
    throw ApiError.internal(`AI request failed: ${err.message}`);
  }

  return parseJson(text);
}

export async function generateText(prompt) {
  try {
    const result = await callWithFallback((model) => ({
      model,
      contents: prompt,
      config: { temperature: 0.7 },
    }));
    return result.text.trim() || "";
  } catch (err) {
    throw ApiError.internal(`AI request failed: ${err.message}`);
  }
}

function parseJson(raw) {
  if (!raw) throw ApiError.internal("AI returned an empty response");
  let cleaned = raw.trim();

  cleaned = cleaned.replace(/^"(?:[^"]|"|[^"]*)"$/, "").trim();

  const firstBrace = cleaned.search(/[[{]/);
  const lastBrace = Math.max(
    cleaned.lastIndexOf("}"),
    cleaned.lastIndexOf("]"),
  );
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  // Strip trailing commas before a closing } or ]
  cleaned = cleaned.replace(/,(\s*[}\]])/g, "$1");

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("❌ Failed to parse AI JSON:", cleaned);
    throw ApiError.internal("AI returned malformed JSON. Please try again.");
  }
}


