import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../../services/property';
import { AuthService } from '../../../services/auth';
import { RentalApplication, Property } from '../../../models/property.model';
import { forkJoin, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-applications-management',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './applications-management.html',
  styleUrls: ['./applications-management.scss']
})
export class ApplicationsManagementComponent implements OnInit {
  applications: Array<RentalApplication & { property?: Property }> = [];
  filteredApplications: Array<RentalApplication & { property?: Property }> = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  statusFilter: string = 'all';
  propertyFilter: string = 'all';
  properties: Property[] = [];
  rejectionReason: string = '';
  selectedApplicationId: string | null = null;

  constructor(
    private propertyService: PropertyService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser || !currentUser._id) {
      this.errorMessage = 'You must be logged in to view applications.';
      this.isLoading = false;
      return;
    }

    // Get properties owned/managed by the current user
    this.propertyService.getAllProperties(
      currentUser.role === 'property_owner' ? { ownerId: currentUser._id } :
      currentUser.role === 'property_manager' ? { managerId: currentUser._id } : {}
    ).subscribe({
      next: (propertiesResponse) => {
        this.properties = propertiesResponse.properties;

        if (this.properties.length === 0) {
          this.isLoading = false;
          return;
        }

        // Get applications for all properties
        const propertyIds = this.properties.map(property => property._id);
        const applicationRequests = propertyIds.map(propertyId =>
          propertyId ? this.propertyService.getApplicationsByProperty(propertyId).pipe(
            catchError(() => of({ applications: [] }))
          ) : of({ applications: [] })
        );

        forkJoin(applicationRequests).subscribe({
          next: (responses) => {
            // Flatten all applications into a single array
            const allApplications: RentalApplication[] = [];
            responses.forEach(response => {
              allApplications.push(...response.applications);
            });

            // Map properties to applications
            this.applications = allApplications.map(application => {
              const property = this.properties.find(p => p._id === application.propertyId);
              return { ...application, property };
            });

            this.filteredApplications = [...this.applications];
            this.isLoading = false;
          },
          error: (error) => {
            this.errorMessage = error.message || 'Failed to load applications.';
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load properties.';
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredApplications = this.applications.filter(app => {
      // Status filter
      if (this.statusFilter !== 'all' && app.status !== this.statusFilter) {
        return false;
      }

      // Property filter
      if (this.propertyFilter !== 'all' && app.propertyId !== this.propertyFilter) {
        return false;
      }

      return true;
    });
  }

  showRejectForm(applicationId: string): void {
    this.selectedApplicationId = applicationId;
    this.rejectionReason = '';
  }

  cancelRejection(): void {
    this.selectedApplicationId = null;
    this.rejectionReason = '';
  }

  approveApplication(applicationId: string): void {
    if (!confirm('Are you sure you want to approve this application?')) {
      return;
    }

    this.propertyService.reviewApplication(applicationId, 'approved').subscribe({
      next: (response) => {
        this.applications = this.applications.map(app => {
          if (app._id === applicationId) {
            return { ...app, status: 'approved' };
          }
          return app;
        });

        this.applyFilters();
        this.successMessage = 'Application approved successfully.';

        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to approve application.';

        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      }
    });
  }

  rejectApplication(): void {
    if (!this.selectedApplicationId || !this.rejectionReason.trim()) {
      return;
    }

    this.propertyService.reviewApplication(
      this.selectedApplicationId,
      'rejected',
      this.rejectionReason
    ).subscribe({
      next: (response) => {
        this.applications = this.applications.map(app => {
          if (app._id === this.selectedApplicationId) {
            return {
              ...app,
              status: 'rejected',
              rejectionReason: this.rejectionReason
            };
          }
          return app;
        });

        this.selectedApplicationId = null;
        this.rejectionReason = '';
        this.applyFilters();
        this.successMessage = 'Application rejected successfully.';

        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to reject application.';

        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      }
    });
  }

  createLease(application: RentalApplication): void {
    if (!confirm('Are you sure you want to create a lease for this application?')) {
      return;
    }

    const property = this.properties.find(p => p._id === application.propertyId);
    if (!property) {
      this.errorMessage = 'Property not found.';
      return;
    }

    const currentUser = this.authService.currentUserValue;
    if (!currentUser || !currentUser._id) {
      this.errorMessage = 'You must be logged in to create a lease.';
      return;
    }

    // Calculate end date based on lease term (months)
    const startDate = new Date(application.moveInDate);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + application.leaseTerm);

    const lease = {
      propertyId: application.propertyId,
      tenantId: application.tenantId,
      ownerId: property.ownerId,
      applicationId: application._id,
      startDate: application.moveInDate,
      endDate: endDate.toISOString().split('T')[0],
      rentAmount: property.rentAmount,
      securityDeposit: property.securityDeposit,
      paymentDueDay: 1, // Default to 1st of month
      lateFeesApplicable: true,
      lateFeeAmount: property.rentAmount * 0.05, // Default to 5% of rent
      lateFeeApplicableAfterDays: 5,
      isActive: true
    };

    this.propertyService.createLease(lease).subscribe({
      next: (response) => {
        this.successMessage = 'Lease created successfully.';

        // Update the application status if it was successful
        this.applications = this.applications.map(app => {
          if (app._id === application._id) {
            return { ...app, status: 'approved' };
          }
          return app;
        });

        this.applyFilters();

        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to create lease.';

        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      }
    });
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
}
