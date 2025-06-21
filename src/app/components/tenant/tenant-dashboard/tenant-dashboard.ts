import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { PropertyService } from '../../../services/property';
import { PropertyUtilsService } from '../../../services/property-utils';
import { RentalApplication, Lease } from '../../../models/property.model';
import { forkJoin, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-tenant-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './tenant-dashboard.html',
  styleUrls: ['./tenant-dashboard.scss']
})
export class TenantDashboardComponent implements OnInit {
  applications: RentalApplication[] = [];
  leases: Lease[] = [];
  isLoading = true;
  errorMessage = '';
  currentUserName = '';

  constructor(
    public authService: AuthService,
    private propertyService: PropertyService,
    private propertyUtils: PropertyUtilsService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser || !currentUser._id) {
      this.errorMessage = 'You must be logged in to view your dashboard.';
      this.isLoading = false;
      return;
    }

    this.currentUserName = currentUser.email?.split('@')[0] || 'Tenant';

    // Load applications and leases
    this.loadUserApplications(currentUser._id);
    this.loadUserLeases(currentUser._id);
  }

  loadUserApplications(userId: string): void {
    this.propertyService.getUserApplications(userId).subscribe({
      next: (response) => {
        this.applications = response.applications;
        this.checkLoading();
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load applications.';
        this.isLoading = false;
      }
    });
  }

  loadUserLeases(userId: string): void {
    this.propertyService.getUserLeases(userId).subscribe({
      next: (response) => {
        this.leases = response.leases;
        this.checkLoading();
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load leases.';
        this.isLoading = false;
      }
    });
  }

  private checkLoading(): void {
    // Both requests completed
    this.isLoading = false;
  }

  getPropertyImageUrl(item: RentalApplication | Lease): string {
    if (item.property) {
      return this.propertyUtils.getImageUrl(item.property);
    }
    return 'url(/assets/images/property-placeholder.jpg)';
  }

  getPropertyAddress(item: RentalApplication | Lease): string {
    if (item.property) {
      return this.propertyUtils.getAddress(item.property);
    }
    return '';
  }

  getPropertyArea(item: RentalApplication | Lease): number {
    if (item.property) {
      return this.propertyUtils.getArea(item.property);
    }
    return 0;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      case 'canceled':
        return 'status-canceled';
      default:
        return 'status-pending';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  getActiveLeases(): Array<Lease> {
    return this.leases.filter(lease => {
      const today = new Date();
      const startDate = new Date(lease.startDate);
      const endDate = new Date(lease.endDate);
      return lease.isActive && startDate <= today && endDate >= today;
    }).slice(0, 3); // Limit to 3 for dashboard
  }

  getPendingApplications(): Array<RentalApplication> {
    return this.applications.filter(app => app.status === 'pending').slice(0, 3); // Limit to 3 for dashboard
  }

  getRecentApplications(): Array<RentalApplication> {
    return [...this.applications]
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || '').getTime();
        const dateB = new Date(b.createdAt || '').getTime();
        return dateB - dateA; // Sort by most recent first
      })
      .slice(0, 3); // Limit to 3 for dashboard
  }

  getApplicationStatusClass(status: string): string {
    switch (status) {
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      case 'canceled': return 'status-canceled';
      default: return 'status-pending';
    }
  }

  getLeaseStatus(lease: Lease): string {
    if (lease.terminationRequested) {
      return 'Termination Requested';
    }

    if (!lease.isActive) {
      return 'Inactive';
    }

    const today = new Date();
    const endDate = new Date(lease.endDate);

    if (endDate < today) {
      return 'Expired';
    }

    const startDate = new Date(lease.startDate);
    if (startDate > today) {
      return 'Future';
    }

    return 'Active';
  }

  getLeaseStatusClass(lease: Lease): string {
    const status = this.getLeaseStatus(lease);

    switch (status) {
      case 'Active': return 'status-active';
      case 'Future': return 'status-future';
      case 'Expired': return 'status-expired';
      case 'Termination Requested': return 'status-termination';
      default: return 'status-inactive';
    }
  }

  getRemainingDays(endDate: string): number {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
