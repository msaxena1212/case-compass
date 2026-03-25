export type NotificationChannel = 'In-App' | 'WhatsApp' | 'Email' | 'SMS';
export type NotificationStatus = 'Unread' | 'Read' | 'Delivered' | 'Failed';
export type NotificationType = 'Hearing' | 'Task' | 'Billing' | 'System' | 'Communication';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  actionUrl?: string;
  timestamp: string;
  metadata?: {
    caseId?: string;
    hearingId?: string;
    taskId?: string;
    invoiceId?: string;
  };
}

export interface CommunicationLog {
  id: string;
  caseId: string;
  clientId: string;
  sender: string;
  receiver: string;
  content: string;
  channel: NotificationChannel;
  status: 'Delivered' | 'Failed' | 'Read';
  timestamp: string;
}
