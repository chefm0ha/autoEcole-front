import { Payment } from './payment.model';
import { Exam } from './exam.model';

export interface ApplicationFile {
  id: number;
  category: string;
  status: 'ACTIVE' | 'EXPIRED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'GRADUATED' | 'FAILED';
  startingDate: string;
  practicalHoursCompleted: number;
  theoreticalHoursCompleted: number;
  fileNumber?: string;
  taxStamp?: 'NOT_PAID' | 'PENDING' | 'PAID';
  medicalVisit?: 'NOT_REQUESTED' | 'PENDING' | 'COMPLETED' | 'EXPIRED';
  payment?: Payment;
  exams?: Exam[];
}

/**
 * DTO for application file from API - matches backend ApplicationFileDTO
 */
export interface ApplicationFileDTO {
  id: number;
  practicalHoursCompleted: number;
  theoreticalHoursCompleted: number;  isActive: boolean;
  startingDate: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';
  fileNumber: string;
  taxStamp: string;
  medicalVisit: 'NOT_REQUESTED' | 'PENDING' | 'COMPLETED' | 'EXPIRED';
  categoryCode: string;
}
