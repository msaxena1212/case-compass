import { ContractType } from "@/types/contract";

export interface ContractTemplate {
  id: string;
  label: string;
  type: ContractType;
  description: string;
  icon: string;
  defaultClauses: string[];
}

export const contractTemplates: ContractTemplate[] = [
  {
    id: 'tpl_nda',
    label: 'Non-Disclosure Agreement',
    type: 'NDA',
    description: 'Protect sensitive information shared between parties.',
    icon: '🤫',
    defaultClauses: ['Confidentiality', 'Exclusions', 'Term', 'Return of Materials']
  },
  {
    id: 'tpl_service',
    label: 'Service Agreement',
    type: 'Service',
    description: 'Define terms for consulting or professional services.',
    icon: '💼',
    defaultClauses: ['Scope of Work', 'Payment Terms', 'Intellectual Property', 'Termination']
  },
  {
    id: 'tpl_employment',
    label: 'Employment Contract',
    type: 'Employment',
    description: 'Standard terms for hiring new office staff or associates.',
    icon: '🤝',
    defaultClauses: ['Compensation', 'Duties', 'Non-Compete', 'Benefits']
  },
  {
    id: 'tpl_lease',
    label: 'Lease Agreement',
    type: 'Lease',
    description: 'Real estate or equipment lease with standard terms.',
    icon: '🏠',
    defaultClauses: ['Rent', 'Maintenance', 'Security Deposit', 'Subletting']
  }
];
