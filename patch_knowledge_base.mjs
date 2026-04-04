import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const knowledgeItems = [
  {
    title: 'Kesavananda Bharati v. State of Kerala (1973)',
    type: 'Judgment',
    snippet: 'Landmark judgment outlining the basic structure doctrine of the Indian Constitution.',
    content: 'In this monumental case, the Supreme Court of India ruled that the Parliament cannot alter or destroy the basic structure of the Constitution. It established the principle that while Parliament has wide powers to amend the Constitution, it does not have the power to destroy its fundamental features or basic structure. This remains the bedrock of Indian constitutional law.',
    tags: ['Constitutional Law', 'Basic Structure', 'Supreme Court'],
    ai_summary: 'Established the "basic structure" doctrine limiting Parliament\'s amending power.',
    views: 12050
  },
  {
    title: 'Maneka Gandhi v. Union of India (1978)',
    type: 'Judgment',
    snippet: 'Expanded the scope of Article 21 (Right to Life and Personal Liberty).',
    content: 'A landmark decision where the Supreme Court held that the procedure established by law under Article 21 must be "fair, just and reasonable, not fanciful, oppressive or arbitrary." This judgment greatly widened the interpretation of personal liberty in India and integrated the concept of due process into the Indian constitutional framework.',
    tags: ['Fundamental Rights', 'Article 21', 'Supreme Court'],
    ai_summary: 'Broadened Article 21 to include fair and reasonable procedures, implicitly reading due process into the Constitution.',
    views: 9400
  },
  {
    title: 'Section 138 of the Negotiable Instruments Act, 1881',
    type: 'Act',
    snippet: 'Penalty for dishonour of cheque for insufficiency, etc., of funds in the account.',
    content: 'Where any cheque drawn by a person on an account maintained by him with a banker for payment of any amount of money to another person from out of that account for the discharge, in whole or in part, of any debt or other liability, is returned by the bank unpaid, either because of the amount of money standing to the credit of that account is insufficient to honour the cheque or that it exceeds the amount arranged to be paid from that account by an agreement made with that bank, such person shall be deemed to have committed an offence and shall, without prejudice to any other provision of this Act, be punished with imprisonment for a term which may be extended to two years, or with fine which may extend to twice the amount of the cheque, or with both.',
    tags: ['NI Act', 'Cheque Bounce', 'Criminal Liability'],
    ai_summary: 'Defines the criminal liability and penalties for the bouncing of a cheque due to insufficient funds.',
    views: 18320
  },
  {
    title: 'The Hindu Marriage Act, 1955 - Section 13 (Divorce)',
    type: 'Act',
    snippet: 'Outlines the grounds on which a decree of divorce may be obtained.',
    content: 'Section 13 of the Hindu Marriage Act details the various grounds for divorce, including adultery, cruelty, desertion for a continuous period of not less than two years, conversion to another religion, unsoundness of mind, severe forms of leprosy, venereal disease in a communicable form, renunciation of the world, or the spouse not being heard of as alive for a period of seven years or more.',
    tags: ['Family Law', 'Divorce', 'Hindu Marriage Act'],
    ai_summary: 'Provides the legal grounds upon which a Hindu marriage may be dissolved by a decree of divorce.',
    views: 15100
  },
  {
    title: 'Draft Non-Disclosure Agreement (NDA) - Mutual',
    type: 'Template',
    snippet: 'A standard mutual non-disclosure agreement template for protecting confidential information during business discussions.',
    content: 'This Mutual Non-Disclosure Agreement ("Agreement") is entered into as of [Date] by and between [Party A Name], located at [Party A Address], and [Party B Name], located at [Party B Address]. The parties intend to engage in discussions regarding a potential business relationship (the "Purpose"). In connection with these discussions, each party may disclose to the other certain confidential and proprietary information. Both parties agree to hold such information in strict confidence and to use it solely for the Purpose, not disclosing it to any third party without prior written consent...',
    tags: ['Template', 'Corporate', 'Confidentiality', 'Contract'],
    ai_summary: 'A standard two-way agreement designed to protect shared confidential information between two entities exploring a business relationship.',
    views: 5200
  },
  {
    title: 'Legal Notice for Recovery of Dues',
    type: 'Template',
    snippet: 'Standard template for issuing a formal legal notice demanding payment of outstanding debts.',
    content: 'Under instructions from and on behalf of my client [Client Name], resident of [Client Address], I hereby address you as follows: That you had sought financial assistance/services from my client on [Date]. That an amount of [Amount] is outstanding and payable by you to my client. That despite repeated reminders, you have failed to clear the dues. You are hereby called upon to pay the principal amount along with interest @ [Interest Rate]% per annum within 15 days of receipt of this notice, failing which my client will be constrained to initiate appropriate civil and criminal proceedings against you in a court of law...',
    tags: ['Template', 'Civil', 'Notice', 'Debt Recovery'],
    ai_summary: 'A formal legal demand letter sent to a defaulter, threatening legal action if outstanding dues are not paid within a specified timeframe.',
    views: 8900
  },
  {
    title: 'Navtej Singh Johar v. Union of India (2018)',
    type: 'Judgment',
    snippet: 'Historic judgment decriminalizing consensual same-sex relations.',
    content: 'The Supreme Court of India unanimously struck down a portion of Section 377 of the Indian Penal Code, stating that it was unconstitutional insofar as it criminalized consensual sexual conduct between adults of the same sex. The court held that the provision violated the fundamental rights to equality, freedom of expression, and privacy.',
    tags: ['LGBTQ+ Rights', 'Section 377', 'Constitutional Law'],
    ai_summary: 'Decriminalized homosexuality in India by reading down Section 377 of the IPC.',
    views: 7800
  },
  {
    title: 'The Indian Contract Act, 1872 - Section 73',
    type: 'Act',
    snippet: 'Compensation for loss or damage caused by breach of contract.',
    content: 'When a contract has been broken, the party who suffers by such breach is entitled to receive, from the party who has broken the contract, compensation for any loss or damage caused to him thereby, which naturally arose in the usual course of things from such breach, or which the parties knew, when they made the contract, to be likely to result from the breach of it. Such compensation is not to be given for any remote and indirect loss or damage sustained by reason of the breach.',
    tags: ['Contract Law', 'Damages', 'Breach of Contract'],
    ai_summary: 'Lays down the rule for claiming unliquidated damages for loss naturally arising from a breach of contract.',
    views: 11200
  }
];

async function seedKnowledgeBase() {
  console.log('Seeding Knowledge Base...');
  
  // Clear generic old data using a simple prefix match or just delete everything
  // For safety, we will just delete everything in the table since it's mock
  const { error: deleteError } = await supabase.from('knowledge_base').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  if (deleteError) {
    console.error('Error clearing old data:', deleteError);
    return;
  }
  
  console.log('Old data cleared.');

  // Insert new data
  const { data, error } = await supabase.from('knowledge_base').insert(knowledgeItems).select();

  if (error) {
    console.error('Error inserting data:', error);
  } else {
    console.log(`Successfully seeded ${data.length} knowledge items.`);
  }
}

seedKnowledgeBase();
