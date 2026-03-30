// Re-purposed to use local Ollama with GLM-5: cloud instead of Gemini API

export const isGeminiAvailable = true;

const OLLAMA_URL = "http://localhost:11434/api/generate";
const DEFAULT_MODEL = "glm-5:cloud";

export async function generateLegalContent(prompt: string, modelName: string = DEFAULT_MODEL) {
  const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const bypassActive = typeof window !== 'undefined' && localStorage.getItem('legaldesk_bypass_ai') === 'true';

  if (isLocalhost && bypassActive) {
    console.log("gemini.ts: Using AI bypass for local development");
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if the prompt is for risk analysis (JSON)
    if (prompt.toLowerCase().includes('json')) {
      return JSON.stringify([
        { text: "Standard mock liability risk detected.", severity: "medium", suggestion: "Review standard indemnity terms." },
        { text: "Missing governing law jurisdiction.", severity: "low", suggestion: "Specify a local court." }
      ]);
    }
    
    return "This is a mock AI summary generated for development purposes. The document appears to be a standard legal filing according to the provided text.";
  }

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
