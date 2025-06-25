export interface Exam {
  id: number;
  examType: 'THEORETICAL' | 'PRACTICAL';
  category: string;
  attemptNumber: number;
  date: string;
  status: 'PASSED' | 'FAILED' | 'SCHEDULED';
}
