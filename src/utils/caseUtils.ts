import { Case } from "@/types/case";

/**
 * Calculates the health score of a case based on its status, filing date, and activity.
 * This is a simplified version of the logic previously in mockData.ts.
 */
export function calculateHealthScore(caseData: Partial<Case>): number {
  if (!caseData) return 0;
  
  let score = 75; // Base score
  
  // Status impact
  if (caseData.status === 'Won') score += 20;
  if (caseData.status === 'Lost') score -= 10;
  if (caseData.status === 'Closed') score += 5;
  if (caseData.status === 'Pending') score -= 5;
  
  // Health score field if it exists
  if ((caseData as any).health_score) {
    return (caseData as any).health_score;
  }
  
  if ((caseData as any).healthScore) {
    return (caseData as any).healthScore;
  }

  // Bound the score between 0 and 100
  return Math.min(100, Math.max(0, score));
}
