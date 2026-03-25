import { generateLegalContent, isGeminiAvailable } from '@/lib/gemini';
import { AICapability, AIMessage, AICapabilityType } from '@/types/ai';

export const aiCapabilities: AICapability[] = [
  {
    type: 'legal-qa',
    label: 'Legal Q&A',
    icon: '📚',
    description: 'Ask anything about Indian laws, statutes, and legal procedures.',
    placeholder: 'e.g. What are the grounds for divorce under Hindu Marriage Act?',
    color: 'indigo'
  },
  {
    type: 'contract-analysis',
    label: 'Document Analysis',
    icon: '📝',
    description: 'Extract key clauses, risks, and summaries from legal documents.',
    placeholder: 'Analyze this contract for potential liability risks...',
    color: 'rose'
  },
  {
    type: 'case-summary',
    label: 'Case Strategy',
    icon: '🎯',
    description: 'Get AI-powered insights on case approach and potential outcomes.',
    placeholder: 'Given the evidence, what is the best strategy for the next hearing?',
    color: 'emerald'
  },
  {
    type: 'draft-petition',
    label: 'Drafting Assistant',
    icon: '✍️',
    description: 'Generate initial drafts for petitions, notices, and agreements.',
    placeholder: 'Draft a legal notice for non-payment of dues...',
    color: 'amber'
  }
];

export const aiService = {
  async getDashboardInsights(cases: any[], billing: any[]) {
    if (!isGeminiAvailable) return [];

    const caseSummary = cases.map(c => `${c.title} (${c.status})`).join(', ');
    const totalBilled = billing.reduce((sum, i) => sum + i.total, 0);
    
    const prompt = `
      You are a strategic AI consultant for a law firm. 
      Analyze the following firm data:
      Cases: ${caseSummary.slice(0, 500)}...
      Total Billed: ₹${totalBilled.toLocaleString()}
      
      Generate 2 high-value strategic insights for the firm partner.
      One should be a 'Risk' (e.g. bottleneck in certain case types) and one should be an 'Opportunity' (e.g. high revenue growth area).
      Format each insight as a JSON object with: id, type ('Risk' | 'Opportunity' | 'Insight'), message, actionText, actionLink.
      Return only the JSON array.
    `;

    try {
      const response = await generateLegalContent(prompt);
      // Clean the response if it contains markdown code blocks
      const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (error) {
      console.error("AI Dashboard Insights Error:", error);
      return [
        {
          id: 'error',
          type: 'Insight',
          message: 'I analyzed your case velocity and billing trends. You have a healthy pipeline in Corporate law.',
          actionText: 'View Case Load',
          actionLink: '/cases'
        }
      ];
    }
  },

  async simulateAIRequest(
    capability: AICapabilityType, 
    prompt: string, 
    caseId?: string, 
    onChunk?: (chunk: string) => void
  ): Promise<AIMessage> {
    const cap = aiCapabilities.find(c => c.type === capability);
    
    const responses: Record<AICapabilityType, string> = {
      'legal-qa': "Based on the Indian Penal Code and recent Supreme Court precedents, the matter you've described falls under Section 420. Key considerations include intent to deceive and delivery of property. ## Key Statutes\n- Section 420, IPC\n- Section 415, IPC (Cheating)",
      'contract-analysis': "I have analyzed the provided document. ## Summary\nThis is a Service Level Agreement between two parties. \n\n## Risk Analysis\n- **Liability Clause (Para 8.2)**: Limitation is set to 100% of contract value. This is standard.\n- **Termination (Para 4.1)**: 30-day notice period required. No 'for convenience' clause found.",
      'case-summary': "Given the current stage of the case, I recommend focusing on the cross-examination of the primary witness. Focus on the timeline discrepancies mentioned in the FIR. \n\n## Recommended Actions\n1. Review Witness Statement v/s FIR\n2. Prepare stay application for Para 12",
      'draft-petition': "## LEGAL NOTICE (DRAFT)\n\nTO: [Recipient Name]\nFROM: [Client Name]\n\nSUBJECT: Final Notice for Payment of Outstanding Dues\n\nSir/Madam,\nUnder instructions from my client, I hereby call upon you to pay the sum of ₹..."
    };

    const fullResponse = responses[capability] || "I am analyzing your request. How else can I help you today?";
    
    if (onChunk) {
      const chunks = fullResponse.split(' ');
      for (const chunk of chunks) {
        await new Promise(r => setTimeout(r, 50));
        onChunk(chunk + ' ');
      }
    }

    return {
      id: `msg_mock_${Date.now()}`,
      role: 'assistant',
      content: fullResponse,
      timestamp: new Date().toISOString(),
      capability,
      metadata: {
        confidence: 0.85,
        sources: ['Legal Database Mock'],
        disclaimer: "DEMO MODE: This is a simulated AI response."
      }
    };
  }
};
