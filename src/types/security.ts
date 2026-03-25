export type UserRole = 'Admin' | 'Partner' | 'Lawyer' | 'Junior Associate' | 'Client';
export type SecurityEventSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type SecurityEventType = 'Login' | 'Access Denied'| 'Data Export' | 'Settings Change' | 'Failed Login';

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceType: 'Case' | 'Document' | 'Invoice' | 'System' | 'Contract';
  timestamp: string;
  ipAddress: string;
  status: 'Success' | 'Failure';
}

export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  severity: SecurityEventSeverity;
  message: string;
  timestamp: string;
  ipAddress?: string;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface AccessControlRule {
  role: UserRole;
  module: string;
  actions: ('View' | 'Edit' | 'Delete' | 'Export')[];
}
