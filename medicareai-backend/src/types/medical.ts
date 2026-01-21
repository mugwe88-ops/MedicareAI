// src/types/medical.ts

export type ReliabilityStatus = 'Reliable' | 'Caution' | 'High Risk';

export interface Patient {
  id: string;
  name: string;
  phoneNumber: string;
  reliabilityScore: number;
  lastVisit?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  startTime: string; // ISO String
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED';
  type: 'NEW_CONSULT' | 'FOLLOW_UP' | 'PROCEDURE' | 'EMERGENCY';
}

export interface MpesaTransaction {
  checkoutRequestId: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  receiptNumber?: string;
}