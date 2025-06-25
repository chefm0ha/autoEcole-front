export interface Session {
  id: number;
  sessionType: 'THEORETICAL' | 'PRACTICAL';
  date: string;
  duration: number;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  candidateCin?: string;
  instructorId?: number;
  vehicleId?: number;
}
