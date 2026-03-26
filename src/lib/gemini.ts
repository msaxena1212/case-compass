// Re-purposed to use local Ollama with GLM-5: cloud instead of Gemini API

export const isGeminiAvailable = true;

const OLLAMA_URL = "http://localhost:11434/api/generate";
const DEFAULT_MODEL = "glm-5:cloud";

export async function generateLegalContent(prompt: string, modelName: string = DEFAULT_MODEL) {
  try {
    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: modelName,
        prompt: prompt,
        stream: false
      })
    });
    
    if (!response.ok) {
      let errText = response.statusText;
      try {
        const errJson = await response.json();
        if (errJson.error) errText = errJson.error;
      } catch (e) {}
      throw new Error(`Ollama API error: ${errText}`);
    }
    
    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("Local AI Generation Error:", error);
    throw error;
  }
}

export async function* generateLegalContentStream(prompt: string, modelName: string = DEFAULT_MODEL) {
  try {
    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: modelName,
        prompt: prompt,
        stream: true
      })
    });

    if (!response.ok || !response.body) {
      let errText = response.statusText;
      try {
        const errJson = await response.clone().json();
        if (errJson.error) errText = errJson.error;
      } catch (e) {}
      throw new Error(`Ollama API error: ${errText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          if (parsed.response) {
            yield parsed.response;
          }
        } catch (e) {
          // Ignore
        }
      }
    }
  } catch (error) {
    console.error("Local AI Streaming Error:", error);
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
