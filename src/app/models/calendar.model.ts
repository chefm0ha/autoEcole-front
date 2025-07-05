// src/app/models/calendar.model.ts

export interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  examCount: number;
  exams: CalendarExam[];
}

export interface CalendarExam {
  id: number;
  candidateName: string;
  candidateCin: string;
  examType: 'THEORY' | 'PRACTICAL';
  category: string;
  status: 'SCHEDULED' | 'PASSED' | 'FAILED';
  time?: string;
  applicationFileId: number;
}

export interface CalendarMonth {
  year: number;
  month: number;
  monthName: string;
  weeks: CalendarWeek[];
}

export interface CalendarWeek {
  days: CalendarDay[];
}

export interface ExamSummary {
  date: string;
  totalExams: number;
  theoryExams: number;
  practicalExams: number;
  scheduledExams: number;
  passedExams: number;
  failedExams: number;
  examsByCategory: { [category: string]: number };
}

// DTO from backend
export interface CalendarExamDTO {
  id: number;
  examType: 'THEORY' | 'PRACTICAL';
  date: string;
  status: 'SCHEDULED' | 'PASSED' | 'FAILED';
  attemptNumber: number;
  candidateFirstName: string;
  candidateLastName: string;
  candidateCin: string;
  categoryCode: string;
  applicationFileId: number;
}