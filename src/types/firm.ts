export type OfficeLocation = 'Mumbai' | 'Delhi' | 'Bangalore' | 'Chennai' | 'Hyderabad';

export interface Office {
  id: string;
  name: string;
  location: OfficeLocation;
  address: string;
  phone: string;
  managerId: string; // User ID of the office head
  staffCount: number;
  activeCasesCount: number;
  monthlyRevenue: number;
  status: 'Active' | 'Inactive';
}

export interface FirmUser {
  id: string;
  name: string;
  email: string;
  role: 'Partner' | 'Senior Lawyer' | 'Associate' | 'Junior' | 'Admin';
  officeId: string;
  department: 'Litigation' | 'Corporate' | 'Family' | 'IP' | 'Criminal' | 'Admin';
  status: 'Active' | 'On Leave' | 'Inactive';
  avatar?: string;
}

export interface RevenueMetric {
  officeId: string;
  month: string;
  revenue: number;
  target: number;
}
