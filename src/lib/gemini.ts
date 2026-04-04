// Re-purposed to use local Ollama with GLM-5: cloud instead of Gemini API

export const isGeminiAvailable = true;

const OLLAMA_URL = "http://localhost:11434/api/generate";
const DEFAULT_MODEL = "nemotron-3-nano:30b-cloud";

export async function generateLegalContent(prompt: string, modelName: string = DEFAULT_MODEL) {
  const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const bypassActive = false; // Disabling bypass to allow real AI requests

  if (isLocalhost && bypassActive) {
    console.log("gemini.ts: Using AI bypass for local development");
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simple hash to vary response based on document content
    const hash = prompt.length % 3;

    // Mock Comparison Data
    if (prompt.includes('similarities') && prompt.includes('differences')) {
      const comparisons = [
        {
          summary: "Compared the documents. The primary document has stronger IP protections while the secondary introduces a new liability cap.",
          similarities: ["Governing law is Delaware in both.", "Standard confidentiality applies to both."],
          differences: ["Doc 1 capped liability at $1M. Doc 2 has unlimited liability.", "Notice period is 30 days vs 60 days."],
          risks: [{ text: "Unlimited liability clause introduced", severity: "high" }]
        },
        {
          summary: "Analysis reveals significant structural changes between versions, moving from a pro-buyer to a pro-seller stance.",
          similarities: ["Payment terms are Net-30.", "Force majeure definitions remain unchanged."],
          differences: ["Termination for convenience was removed.", "Added binding arbitration clause instead of litigation."],
          risks: [{ text: "Loss of termination rights", severity: "medium" }, { text: "Forced arbitration", severity: "medium" }]
        },
        {
          summary: "The documents are highly similar, representing minor formatting corrections rather than substantive legal changes.",
          similarities: ["All material commercial terms match exactly.", "Signatories and execution dates are identical."],
          differences: ["Corrected spelling of 'Indemnification'.", "Updated registered address for the corporate entity."],
          risks: [{ text: "Minor administrative updates only", severity: "low" }]
        }
      ];
      return JSON.stringify(comparisons[hash]);
    }

    // Mock Risk Analysis (JSON)
    if (prompt.toLowerCase().includes('json')) {
      const risks = [
        [
          { text: "Standard mock liability risk detected.", severity: "medium", suggestion: "Review standard indemnity terms." },
          { text: "Missing governing law jurisdiction.", severity: "low", suggestion: "Specify a local court." }
        ],
        [
          { text: "High probability of breach due to ambiguous delivery timelines.", severity: "high", suggestion: "Define clear delivery milestones." },
          { text: "Uncapped indemnification clause.", severity: "high", suggestion: "Add a liability cap to the indemnification." }
        ],
        [
          { text: "Conflicting notice periods for termination.", severity: "medium", suggestion: "Clarify termination conditions." },
          { text: "Non-compete clause is overly broad.", severity: "medium", suggestion: "Limit geographical scope of non-compete." },
          { text: "Missing force majeure clause.", severity: "low", suggestion: "Include standard force majeure language." }
        ]
      ];
      return JSON.stringify(risks[hash]);
    }

    // Mock Summaries
    const summaries = [
      "This document outlines standard legal terms and conditions. It specifies the obligations of tracking software usage, standard confidentiality, and establishes immediate breach notification protocols.",
      "The attached file is a commercial contract detailing key payment terms and IP assignment. Notable is the requirement for Net-30 payment and immediate transfer of intellectual properties upon creation.",
      "This filing contains witness statements and procedural timelines. Key dates include a deadline for document discovery by next month, and mandates arbitration for any arising disputes."
    ];
    return summaries[hash];
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
      } catch (e) { }
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
      } catch (e) { }
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
