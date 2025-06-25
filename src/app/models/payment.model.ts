export interface PaymentInstallment {
  id: number;
  installmentNumber: number;
  amount: number;
  date: string;
}

export interface Payment {
  id: number;
  totalAmount: number;
  paidAmount: number;
  status: 'PENDING' | 'COMPLETED' | 'UNPAID';
  installments: PaymentInstallment[];
}

/**
 * DTO for payment from API - matches backend PaymentDTO
 */
export interface PaymentDTO {
  id: number;
  paidAmount: number;
  status: 'PENDING' | 'COMPLETED' | 'UNPAID';
  totalAmount: number;
  paymentInstallments: PaymentInstallmentDTO[];
}

export interface PaymentInstallmentDTO {
  id: number;
  amount: number;
  date: string;
  installmentNumber: number;
}
