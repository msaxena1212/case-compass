export type IntegrationProvider = 'Gmail' | 'Outlook' | 'Google Calendar' | 'WhatsApp' | 'Razorpay' | 'Stripe' | 'Dropbox' | 'Slack';
export type IntegrationStatus = 'Connected' | 'Disconnected' | 'Syncing' | 'Error';
export type SyncStatus = 'Success' | 'Failure' | 'Pending';

export interface Integration {
  id: string;
  provider: IntegrationProvider;
  type: 'Email' | 'Calendar' | 'Communication' | 'Payment' | 'Storage';
  status: IntegrationStatus;
  lastSync?: string;
  icon: string;
  description: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  role: 'Admin' | 'Read-Only' | 'Write-Only';
  createdAt: string;
  lastUsed?: string;
  status: 'Active' | 'Revoked';
}

export interface ApiSyncLog {
  id: string;
  integrationId: string;
  provider: IntegrationProvider;
  event: string;
  status: SyncStatus;
  timestamp: string;
  details?: string;
}
