# Case Compass Legal OS

> **Next-Gen Law Firm Management & Intelligence**

## 1. Project Overview
Case Compass is a comprehensive **Legal Operating System (Legal OS)** designed to streamline the operations of modern, multi-branch law firms. It provides a centralized platform for managing the entire legal lifecycle—from client intake and case management to professional billing and firm-wide resource orchestration.

## 2. Core Modules

### 📂 Case Management
- **Full Lifecycle Tracking**: Manage cases from filing to resolution with status tracking (Open, Pending, Won, Lost, etc.).
- **Court Calendar**: Track upcoming hearings, cross-examinations, and judges.
- **Case Transfer System**: Dynamically move cases between office branches and advocates to handle workload spikes.

### 💰 Financial Operations (Billing)
- **Professional Invoicing**: Generate detailed invoices with tax calculations and multi-item billing.
- **Two-Step Payment Recording**: Tiered workflow requiring Client selection followed by filtered Invoice selection for accuracy.
- **Revenue Intelligence**: Real-time tracking of paid, partial, and outstanding payments at firm and branch levels.

### 🏢 Firm Management & RBAC
- **Multi-Office Support**: Manage HQ and regional branches (e.g., Mumbai, Bengaluru, Delhi) with independent staff tracking.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions for Admin, Partner, Lawyer, and Junior Associate roles across different modules.
- **Global Team Orchestration**: Centralized view of all legal professionals, roles, and branch assignments.

### 📄 Document Intelligence
- **Document Vault**: Secure storage for legal briefs, pleadings, and evidence.
- **AI-Powered Analysis**: Integration with local LLMs (Ollama) for automated legal document summarization and insights.
- **Brand Identity**: Customizable invoice and document templates with firm logos and color profiles.

## 3. Technical Stack

- **Frontend**: React (Vite), TypeScript, Tailwind CSS, Shadcn UI, Framer Motion.
- **State Management**: TanStack Query (React Query) for robust data fetching and caching.
- **Backend & DB**: Supabase (PostgreSQL) with Row-Level Security (RLS) for data privacy.
- **Authentication**: Supabase Auth integrated with custom Profile synchronization.
- **Intelligence**: Local AI bypass for testing (Ollama support).

## 4. Key Security Features
- **Row Level Security (RLS)**: Database-level protection ensuring users only see data they are authorized to access.
- **RBAC Matrix**: Interactive permissions builder allows admins to modify access levels for every role and module on the fly.
- **Audit Logging**: Tracking of system-wide actions for compliance and accountability.

## 5. Setup & Development

### Prerequisites
- Node.js (v18+)
- Supabase Project (Database + Auth)

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd case-compass

# Install dependencies
npm install

# Setup Environment Variables
# Create a .env file with your Supabase credentials:
# VITE_SUPABASE_URL=your_url
# VITE_SUPABASE_ANON_KEY=your_key

# Run Development Server
npm run dev
```

### Database Seeding
Use the provided `supabase/ultimate_mock_seed.sql` in the Supabase SQL Editor to populate the system with:
1.  **Office Branches** (Mumbai HQ, Bengaluru, Delhi).
2.  **Mock Advocates** (3 per branch).
3.  **Clients & Cases** (50+ records).
4.  **Billing Data** (Invoices & Payments).
