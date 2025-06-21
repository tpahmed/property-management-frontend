import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PropertyService } from '../../../services/property';
import { AuthService } from '../../../services/auth';
import { PropertyUtilsService } from '../../../services/property-utils';
import { RentalApplication } from '../../../models/property.model';

@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-applications.html',
  styleUrls: ['./my-applications.scss']
})
export class MyApplicationsComponent implements OnInit {
  applications: RentalApplication[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private propertyService: PropertyService,
    private authService: AuthService,
    private propertyUtils: PropertyUtilsService
  ) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const currentUser = this.authService.currentUserValue;
    if (!currentUser || !currentUser._id) {
      this.errorMessage = 'You must be logged in to view your applications.';
      this.isLoading = false;
      return;
    }

    this.propertyService.getUserApplications(currentUser._id).subscribe({
      next: (response) => {
        this.applications = response.applications;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load applications.';
        this.isLoading = false;
      }
    });
  }

  getPropertyImageUrl(application: RentalApplication): string {
    if (application.property) {
      return this.propertyUtils.getImageUrl(application.property);
    }
    return 'url(/assets/images/property-placeholder.jpg)';
  }

  getPropertyAddress(application: RentalApplication): string {
    if (application.property) {
      return this.propertyUtils.getAddress(application.property);
    }
    return '';
  }

  getPropertyArea(application: RentalApplication): number {
    if (application.property) {
      return this.propertyUtils.getArea(application.property);
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

  cancelApplication(applicationId: string): void {
    if (!confirm('Are you sure you want to cancel this application?')) {
      return;
    }

    this.propertyService.reviewApplication(applicationId, 'canceled').subscribe({
      next: () => {
        this.applications = this.applications.map(app => {
          if (app._id === applicationId) {
            return { ...app, status: 'canceled' };
          }
          return app;
        });
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to cancel application.';
      }
    });
  }
}
