import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../../services/property';
import { AuthService } from '../../../services/auth';
import { Lease, Property } from '../../../models/property.model';
import { forkJoin, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-leases-management',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './leases-management.html',
  styleUrls: ['./leases-management.scss']
})
export class LeasesManagementComponent implements OnInit {
  leases: Array<Lease & { property?: Property }> = [];
  filteredLeases: Array<Lease & { property?: Property }> = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  statusFilter: string = 'all';
  propertyFilter: string = 'all';
  properties: Property[] = [];
  terminationResponse: string = '';
  selectedLeaseId: string | null = null;
  terminationApproved: boolean = false;

  constructor(
    private propertyService: PropertyService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser || !currentUser._id) {
      this.errorMessage = 'You must be logged in to view leases.';
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

        // Get leases for all properties
        const propertyIds = this.properties.map(property => property._id);
        const leaseRequests = propertyIds.map(propertyId =>
          propertyId ? this.propertyService.getPropertyLeases(propertyId).pipe(
            catchError(() => of({ leases: [] }))
          ) : of({ leases: [] })
        );

        forkJoin(leaseRequests).subscribe({
          next: (responses) => {
            // Flatten all leases into a single array
            const allLeases: Lease[] = [];
            responses.forEach(response => {
              allLeases.push(...response.leases);
            });

            // Map properties to leases
            this.leases = allLeases.map(lease => {
              const property = this.properties.find(p => p._id === lease.propertyId);
              return { ...lease, property };
            });

            this.filteredLeases = [...this.leases];
            this.isLoading = false;
          },
          error: (error) => {
            this.errorMessage = error.message || 'Failed to load leases.';
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
    this.filteredLeases = this.leases.filter(lease => {
      // Status filter
      if (this.statusFilter !== 'all') {
        const leaseStatus = this.getLeaseStatus(lease);
        if (leaseStatus.toLowerCase() !== this.statusFilter.toLowerCase()) {
          return false;
        }
      }

      // Property filter
      if (this.propertyFilter !== 'all' && lease.propertyId !== this.propertyFilter) {
        return false;
      }

      return true;
    });
  }

  showTerminationResponseForm(leaseId: string): void {
    this.selectedLeaseId = leaseId;
    this.terminationResponse = '';
    this.terminationApproved = false;
  }

  cancelTerminationResponse(): void {
    this.selectedLeaseId = null;
    this.terminationResponse = '';
    this.terminationApproved = false;
  }

  submitTerminationResponse(): void {
    if (!this.selectedLeaseId || !this.terminationResponse.trim()) {
      return;
    }

    const lease = this.leases.find(l => l._id === this.selectedLeaseId);
    if (!lease) {
      this.errorMessage = 'Lease not found.';
      return;
    }

    // In a real application, you would call an API to update the termination details
    // Here we're just updating the local state
    const updatedLease = {
      ...lease,
      terminationDetails: {
        ...lease.terminationDetails,
        approvedBy: this.authService.currentUserValue?._id,
        approvedDate: new Date().toISOString(),
        reason: lease.terminationDetails?.reason || '',
        moveOutDate: lease.terminationDetails?.moveOutDate || '',
        requestedBy: lease.terminationDetails?.requestedBy || 'tenant',
        requestDate: lease.terminationDetails?.requestDate || ''
      },
      isActive: !this.terminationApproved
    };

    // Update the lease in the list
    this.leases = this.leases.map(l => {
      if (l._id === this.selectedLeaseId) {
        return updatedLease;
      }
      return l;
    });

    this.selectedLeaseId = null;
    this.terminationResponse = '';
    this.terminationApproved = false;
    this.applyFilters();
    this.successMessage = 'Termination request ' +
      (this.terminationApproved ? 'approved' : 'rejected') + ' successfully.';

    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
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

  getStatusClass(lease: Lease): string {
    const status = this.getLeaseStatus(lease);

    switch (status) {
      case 'Active':
        return 'status-active';
      case 'Future':
        return 'status-future';
      case 'Expired':
        return 'status-expired';
      case 'Termination Requested':
        return 'status-termination';
      default:
        return 'status-inactive';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  getRemainingDays(endDate: string): number {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getDayOrdinal(day: number): string {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }
}
