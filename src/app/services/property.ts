import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Property,
  RentalApplication,
  Lease,
  PropertyResponse,
  ApplicationResponse,
  LeaseResponse,
  PropertiesResponse,
  ApplicationsResponse,
  LeasesResponse,
  PropertyFilter
} from '../models/property.model';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private apiUrl = 'http://localhost:3000/api/properties';
  private applicationsUrl = 'http://localhost:3000/api/applications';
  private leasesUrl = 'http://localhost:3000/api/leases';

  constructor(private http: HttpClient) {}

  // Property endpoints
  getAllProperties(filters?: PropertyFilter): Observable<PropertiesResponse> {
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

    return this.http.get<PropertiesResponse>(url);
  }

  getPropertyById(id: string): Observable<PropertyResponse> {
    return this.http.get<PropertyResponse>(`${this.apiUrl}/${id}`);
  }

  createProperty(property: Property): Observable<PropertyResponse> {
    return this.http.post<PropertyResponse>(this.apiUrl, property);
  }

  updateProperty(id: string, property: Partial<Property>): Observable<PropertyResponse> {
    return this.http.put<PropertyResponse>(`${this.apiUrl}/${id}`, property);
  }

  deleteProperty(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }

  getAvailableRentals(): Observable<PropertiesResponse> {
    return this.http.get<PropertiesResponse>(`${this.apiUrl}/available`);
  }

  getOwnerProperties(ownerId: string): Observable<PropertiesResponse> {
    return this.http.get<PropertiesResponse>(`${this.apiUrl}/owner/${ownerId}`);
  }

  getManagedProperties(managerId: string): Observable<PropertiesResponse> {
    return this.http.get<PropertiesResponse>(`${this.apiUrl}/manager/${managerId}`);
  }

  // Application methods
  submitApplication(application: RentalApplication): Observable<ApplicationResponse> {
    return this.http.post<ApplicationResponse>(`${this.applicationsUrl}`, application);
  }

  getApplicationsByProperty(propertyId: string): Observable<ApplicationsResponse> {
    return this.http.get<ApplicationsResponse>(`${this.applicationsUrl}/property/${propertyId}`);
  }

  getUserApplications(userId: string): Observable<ApplicationsResponse> {
    return this.http.get<ApplicationsResponse>(`${this.applicationsUrl}/tenant/${userId}`);
  }

  reviewApplication(applicationId: string, status: string, rejectionReason?: string): Observable<ApplicationResponse> {
    return this.http.put<ApplicationResponse>(`${this.applicationsUrl}/review`, {
      applicationId,
      status,
      rejectionReason
    });
  }

  // Lease methods
  createLease(lease: Lease): Observable<LeaseResponse> {
    return this.http.post<LeaseResponse>(`${this.leasesUrl}`, lease);
  }

  getPropertyLeases(propertyId: string): Observable<LeasesResponse> {
    return this.http.get<LeasesResponse>(`${this.leasesUrl}/property/${propertyId}`);
  }

  getUserLeases(userId: string): Observable<LeasesResponse> {
    return this.http.get<LeasesResponse>(`${this.leasesUrl}/tenant/${userId}`);
  }

  requestTermination(leaseId: string, reason: string, moveOutDate?: string): Observable<LeaseResponse> {
    return this.http.post<LeaseResponse>(`${this.leasesUrl}/terminate`, {
      leaseId,
      reason,
      moveOutDate
    });
  }

  // Manager assignment methods
  assignManager(propertyId: string, managerId: string): Observable<PropertyResponse> {
    return this.http.post<PropertyResponse>(`${this.apiUrl}/assign-manager`, {
      propertyId,
      managerId
    });
  }

  removeManager(propertyId: string): Observable<PropertyResponse> {
    return this.http.put<PropertyResponse>(`${this.apiUrl}/${propertyId}/remove-manager`, {});
  }
}
