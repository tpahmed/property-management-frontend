import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Payment, PaymentResponse, PaymentsResponse } from '../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:3000/api/payments';

  constructor(private http: HttpClient) {}

  getAllPayments(filters?: any): Observable<PaymentsResponse> {
    let url = this.apiUrl;

    if (filters) {
      const queryParams = Object.entries(filters)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');

      if (queryParams) {
        url += `?${queryParams}`;
      }
    }

    return this.http.get<PaymentsResponse>(url);
  }

  getPaymentById(id: string): Observable<PaymentResponse> {
    return this.http.get<PaymentResponse>(`${this.apiUrl}/${id}`);
  }

  createPayment(paymentData: Payment): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(this.apiUrl, paymentData);
  }

  updatePaymentStatus(id: string, status: string): Observable<PaymentResponse> {
    return this.http.patch<PaymentResponse>(`${this.apiUrl}/${id}/status`, { status });
  }

  processPayment(id: string): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.apiUrl}/${id}/process`, {});
  }

  cancelPayment(id: string): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.apiUrl}/${id}/cancel`, {});
  }

  refundPayment(id: string): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.apiUrl}/${id}/refund`, {});
  }

  downloadReceipt(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/receipt`, { responseType: 'blob' });
  }

  getPaymentsByLeaseId(leaseId: string): Observable<PaymentsResponse> {
    return this.http.get<PaymentsResponse>(`${this.apiUrl}?leaseId=${leaseId}`);
  }

  getPaymentsByPropertyId(propertyId: string): Observable<PaymentsResponse> {
    return this.http.get<PaymentsResponse>(`${this.apiUrl}?propertyId=${propertyId}`);
  }

  getPaymentsByTenantId(tenantId: string): Observable<PaymentsResponse> {
    return this.http.get<PaymentsResponse>(`${this.apiUrl}/tenant/${tenantId}`);
  }

  getPaymentsByOwnerId(ownerId: string): Observable<PaymentsResponse> {
    return this.http.get<PaymentsResponse>(`${this.apiUrl}/owner/${ownerId}`);
  }

  // Methods for tenant and property owner/manager views
  getTenantPayments(tenantId: string): Observable<PaymentsResponse> {
    return this.http.get<PaymentsResponse>(`${this.apiUrl}/tenant/${tenantId}`);
  }

  getPropertyPayments(propertyId: string): Observable<PaymentsResponse> {
    return this.http.get<PaymentsResponse>(`${this.apiUrl}/property/${propertyId}`);
  }

  // Payment processing methods
  processPaymentDetails(paymentId: string, paymentDetails: any): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.apiUrl}/${paymentId}/process`, paymentDetails);
  }

  recordPayment(payment: Payment): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.apiUrl}/record`, payment);
  }
}
