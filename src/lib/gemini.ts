import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export async function generateLegalContent(prompt: string, modelName: string = "gemini-1.5-pro") {
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

export async function* generateLegalContentStream(prompt: string, modelName: string = "gemini-1.5-pro") {
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
