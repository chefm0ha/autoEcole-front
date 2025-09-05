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
}
