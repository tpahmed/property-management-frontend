import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MaintenanceRequest } from '../models/maintenance.model';
import { Maintenance } from '../models/maintenance.model';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {
  private apiUrl = 'http://localhost:3000/api/maintenance';

  constructor(private http: HttpClient) { }

  getAllRequests(filters?: any): Observable<{ requests: MaintenanceRequest[] }> {
    let queryParams = '';
    if (filters) {
      queryParams = '?' + Object.entries(filters)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');
    }
    return this.http.get<{ requests: MaintenanceRequest[] }>(`${this.apiUrl}${queryParams}`);
  }

  getRequestById(id: string): Observable<{ request: MaintenanceRequest }> {
    return this.http.get<{ request: MaintenanceRequest }>(`${this.apiUrl}/${id}`);
  }

  createRequest(request: MaintenanceRequest): Observable<{ message: string; request: MaintenanceRequest }> {
    return this.http.post<{ message: string; request: MaintenanceRequest }>(this.apiUrl, request);
  }

  updateRequestStatus(id: string, status: string): Observable<{ message: string; request: MaintenanceRequest }> {
    return this.http.patch<{ message: string; request: MaintenanceRequest }>(
      `${this.apiUrl}/${id}/status`,
      { status }
    );
  }

  assignRequest(id: string, assignedTo: string, scheduledDate?: string): Observable<{ message: string; request: MaintenanceRequest }> {
    return this.http.patch<{ message: string; request: MaintenanceRequest }>(
      `${this.apiUrl}/${id}/assign`,
      { assignedTo, scheduledDate }
    );
  }

  addNote(id: string, text: string, isPublic: boolean = true): Observable<{ message: string; request: MaintenanceRequest }> {
    return this.http.post<{ message: string; request: MaintenanceRequest }>(
      `${this.apiUrl}/${id}/notes`,
      { text, isPublic }
    );
  }

  completeRequest(id: string, cost?: { amount: number; currency: string; details?: string }): Observable<{ message: string; request: MaintenanceRequest }> {
    return this.http.patch<{ message: string; request: MaintenanceRequest }>(
      `${this.apiUrl}/${id}/complete`,
      { cost }
    );
  }

  rateRequest(id: string, score: number, comment?: string): Observable<{ message: string; request: MaintenanceRequest }> {
    return this.http.post<{ message: string; request: MaintenanceRequest }>(
      `${this.apiUrl}/${id}/rate`,
      { score, comment }
    );
  }

  getAllMaintenanceRequests(): Observable<{ maintenanceRequests: Maintenance[] }> {
    return this.http.get<{ maintenanceRequests: Maintenance[] }>(this.apiUrl);
  }

  getMaintenanceRequestById(id: string): Observable<{ maintenanceRequest: Maintenance }> {
    return this.http.get<{ maintenanceRequest: Maintenance }>(`${this.apiUrl}/${id}`);
  }

  createMaintenanceRequest(maintenanceRequest: Maintenance): Observable<{ maintenanceRequest: Maintenance }> {
    return this.http.post<{ maintenanceRequest: Maintenance }>(this.apiUrl, maintenanceRequest);
  }

  updateMaintenanceRequest(id: string, maintenanceRequest: Maintenance): Observable<{ maintenanceRequest: Maintenance }> {
    return this.http.put<{ maintenanceRequest: Maintenance }>(`${this.apiUrl}/${id}`, maintenanceRequest);
  }

  deleteMaintenanceRequest(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  getTenantMaintenanceRequests(tenantId: string): Observable<{ maintenanceRequests: Maintenance[] }> {
    return this.http.get<{ maintenanceRequests: Maintenance[] }>(`${this.apiUrl}/tenant/${tenantId}`);
  }

  getPropertyMaintenanceRequests(propertyId: string): Observable<{ maintenanceRequests: Maintenance[] }> {
    return this.http.get<{ maintenanceRequests: Maintenance[] }>(`${this.apiUrl}/property/${propertyId}`);
  }

  updateMaintenanceStatus(id: string, status: string, notes?: string): Observable<{ maintenanceRequest: Maintenance }> {
    return this.http.put<{ maintenanceRequest: Maintenance }>(`${this.apiUrl}/${id}/status`, { status, notes });
  }

  assignMaintenanceRequest(id: string, assignedTo: string): Observable<{ maintenanceRequest: Maintenance }> {
    return this.http.put<{ maintenanceRequest: Maintenance }>(`${this.apiUrl}/${id}/assign`, { assignedTo });
  }

  scheduleMaintenanceRequest(id: string, scheduledDate: string): Observable<{ maintenanceRequest: Maintenance }> {
    return this.http.put<{ maintenanceRequest: Maintenance }>(`${this.apiUrl}/${id}/schedule`, { scheduledDate });
  }

  completeMaintenanceRequest(id: string, completionDetails: any): Observable<{ maintenanceRequest: Maintenance }> {
    return this.http.put<{ maintenanceRequest: Maintenance }>(`${this.apiUrl}/${id}/complete`, completionDetails);
  }
}
