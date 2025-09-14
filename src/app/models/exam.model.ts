export interface Exam {
  id: number;
  examType: 'THEORY' | 'PRACTICAL';
  category: string;
  attemptNumber: number;
  date: string;
  status: 'PASSED' | 'FAILED' | 'SCHEDULED';
}

// DTO for creating/saving exam
export interface SaveExamRequest {
  examType: 'THEORY' | 'PRACTICAL';
  date: string;
  status: 'PASSED' | 'FAILED' | 'SCHEDULED';
  immatriculation?: string; // Required for practical exams
}

// DTO for exam response from API
export interface ExamDTO {
  id: number;
  examType: 'THEORY' | 'PRACTICAL';
  date: string;
  status: 'PASSED' | 'FAILED' | 'SCHEDULED';
  attemptNumber: number;
  candidateName?: string;
  candidateCin?: string;
  immatriculation?: string;
}

// Dashboard exam interface with additional information
export interface DashboardExamDTO extends ExamDTO {
  candidateFirstName?: string;
  candidateLastName?: string;
  applicationFileId?: number;
  timeRemaining?: string;
  dayOfWeek?: string;
}

// Exam statistics for dashboard
export interface ExamStatistics {
  totalScheduledThisWeek: number;
  successRateThisMonth: number;
  totalExamsThisMonth: number;
  upcomingExams: DashboardExamDTO[];
}
