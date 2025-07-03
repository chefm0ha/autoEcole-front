import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaymentDTO } from '../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private baseUrl = 'http://localhost:9090';

  constructor(private http: HttpClient) {}  /**
   * Get payment details for a specific application file
   * @param applicationFileId The ID of the application file
   * @returns Observable<PaymentDTO>
   */
  getPaymentByApplicationFile(applicationFileId: number): Observable<PaymentDTO> {
    return this.http.get<PaymentDTO>(`${this.baseUrl}/payment/getPaymentByApplicationFile/${applicationFileId}`, {
      withCredentials: true
    });
  }
  /**
   * Save a payment installment for an application file
   * @param applicationFileId The ID of the application file
   * @param amount The payment amount
   * @returns Observable<PaymentDTO> - Complete payment data with updated installments
   */
  savePaymentInstallment(applicationFileId: number, amount: number): Observable<PaymentDTO> {
    return this.http.post<PaymentDTO>(
      `${this.baseUrl}/paymentInstallment/savePaymentInstallment/${applicationFileId}?amount=${amount}`, 
      {}, 
      { withCredentials: true }
    );
  }
}
