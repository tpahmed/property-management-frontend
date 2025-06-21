import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MaintenanceService } from '../../../services/maintenance';
import { AuthService } from '../../../services/auth';
import { PropertyService } from '../../../services/property';
import { Maintenance } from '../../../models/maintenance.model';
import { Property } from '../../../models/property.model';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-maintenance-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './maintenance-list.html',
  styleUrls: ['./maintenance-list.scss']
})
export class MaintenanceListComponent implements OnInit {
  maintenanceRequests: Array<Maintenance & { property?: Property }> = [];
  filteredRequests: Array<Maintenance & { property?: Property }> = [];
  isLoading = true;
  errorMessage = '';
  statusFilter: string = 'all';
  propertyFilter: string = 'all';
  properties: Property[] = [];
  userRole: string = '';

  constructor(
    private maintenanceService: MaintenanceService,
    private authService: AuthService,
    private propertyService: PropertyService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser || !currentUser._id) {
      this.errorMessage = 'You must be logged in to view maintenance requests.';
      this.isLoading = false;
      return;
    }

    this.userRole = currentUser.role;

    // Different loading strategy based on user role
    if (currentUser.role === 'tenant') {
      this.loadTenantMaintenanceRequests(currentUser._id);
    } else if (currentUser.role === 'property_owner' || currentUser.role === 'property_manager') {
      this.loadPropertyManagerMaintenanceRequests(currentUser._id, currentUser.role);
    } else {
      this.errorMessage = 'Unauthorized role.';
      this.isLoading = false;
    }
  }

  loadTenantMaintenanceRequests(tenantId: string): void {
    this.maintenanceService.getTenantMaintenanceRequests(tenantId).subscribe({
      next: (response) => {
        this.maintenanceRequests = response.maintenanceRequests;
        this.filteredRequests = [...this.maintenanceRequests];
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load maintenance requests.';
        this.isLoading = false;
      }
    });
  }

  loadPropertyManagerMaintenanceRequests(userId: string, role: string): void {
    // First, get properties owned/managed by the user
    this.propertyService.getAllProperties(
      role === 'property_owner' ? { ownerId: userId } :
      role === 'property_manager' ? { managerId: userId } : {}
    ).subscribe({
      next: (propertiesResponse) => {
        this.properties = propertiesResponse.properties;

        if (this.properties.length === 0) {
          this.isLoading = false;
          return;
        }

        // Get maintenance requests for all properties
        const propertyIds = this.properties.map(property => property._id);
        const maintenanceRequests = propertyIds.map(propertyId =>
          propertyId ? this.maintenanceService.getPropertyMaintenanceRequests(propertyId).pipe(
            catchError(() => of({ maintenanceRequests: [] }))
          ) : of({ maintenanceRequests: [] })
        );

        forkJoin(maintenanceRequests).subscribe({
          next: (responses) => {
            // Flatten all maintenance requests into a single array
            const allRequests: Maintenance[] = [];
            responses.forEach(response => {
              allRequests.push(...response.maintenanceRequests);
            });

            // Map properties to maintenance requests
            this.maintenanceRequests = allRequests.map(request => {
              const property = this.properties.find(p => p._id === request.propertyId);
              return { ...request, property };
            });

            this.filteredRequests = [...this.maintenanceRequests];
            this.isLoading = false;
          },
          error: (error) => {
            this.errorMessage = error.message || 'Failed to load maintenance requests.';
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
    this.filteredRequests = this.maintenanceRequests.filter(request => {
      // Status filter
      if (this.statusFilter !== 'all' && request.status !== this.statusFilter) {
        return false;
      }

      // Property filter (only for property managers/owners)
      if (this.userRole !== 'tenant' && this.propertyFilter !== 'all' && request.propertyId !== this.propertyFilter) {
        return false;
      }

      return true;
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'in_progress':
        return 'status-in-progress';
      case 'completed':
        return 'status-completed';
      case 'canceled':
        return 'status-canceled';
      default:
        return '';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'low':
        return 'priority-low';
      case 'medium':
        return 'priority-medium';
      case 'high':
        return 'priority-high';
      case 'emergency':
        return 'priority-emergency';
      default:
        return '';
    }
  }
}
