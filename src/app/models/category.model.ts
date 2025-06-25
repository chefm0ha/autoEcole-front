export interface Category {
  code: string;
  description: string;
  minAge: number;
}

/**
 * DTO for creating a new application file
 */
export interface CreateApplicationFileRequest {
  categoryCode: string;
  totalAmount: number;
  initialAmount: number;
}
