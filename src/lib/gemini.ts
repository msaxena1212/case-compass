import { GoogleGenerativeAI } from "@google/generative-ai";

// TEMPORARY HARDCODE - Env variables are not being picked up by Vite on this system
const apiKey = "AIzaSyD6HQ3C-8zeCanJ9PLDCxxLTbQgOJfR1P0";

// Simple check to see if the API key is provided and looks like a real key
export const isGeminiAvailable = !!apiKey && apiKey.length > 20 && !apiKey.startsWith("YOUR_");

const genAI = new GoogleGenerativeAI(apiKey || "");

export async function generateLegalContent(prompt: string, modelName: string = "gemini-3.1-flash-lite-preview") {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini AI Generation Error:", error);
    throw error;
  }
}

export async function* generateLegalContentStream(prompt: string, modelName: string = "gemini-3.1-flash-lite-preview") {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContentStream(prompt);
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      yield chunkText;
    }
  } catch (error) {
    console.error("Gemini AI Streaming Error:", error);
    throw error;
  }
}

export async function summarizeDocument(text: string) {
  const prompt = `Summarize the following legal document into a concise brief with key points, parties involved, and critical dates:\n\n${text}`;
  return generateLegalContent(prompt);
}

export async function analyzeLegalRisk(text: string) {
  const prompt = `Analyze the following contract for potential legal risks. List each risk with its severity (High/Medium/Low) and a suggested mitigation strategy. Format as JSON:\n\n${text}`;
  return generateLegalContent(prompt);
}
