import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PropertyService } from '../../../services/property';
import { AuthService } from '../../../services/auth';
import { PropertyUtilsService } from '../../../services/property-utils';
import { Lease } from '../../../models/property.model';

@Component({
  selector: 'app-my-leases',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './my-leases.html',
  styleUrls: ['./my-leases.scss']
})
export class MyLeasesComponent implements OnInit {
  leases: Lease[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  isModalOpen = false;
  selectedLeaseId = '';
  terminationReason = '';
  moveOutDate = '';
  isSubmitting = false;
  terminationForm: FormGroup;

  constructor(
    private propertyService: PropertyService,
    private authService: AuthService,
    private propertyUtils: PropertyUtilsService,
    private fb: FormBuilder
  ) {
    this.terminationForm = this.fb.group({
      reason: ['', Validators.required],
      moveOutDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadLeases();
  }

  loadLeases(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const currentUser = this.authService.currentUserValue;
    if (!currentUser || !currentUser._id) {
      this.errorMessage = 'You must be logged in to view your leases.';
      this.isLoading = false;
      return;
    }

    this.propertyService.getUserLeases(currentUser._id).subscribe({
      next: (response) => {
        this.leases = response.leases;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load leases.';
        this.isLoading = false;
      }
    });
  }

  getPropertyImageUrl(lease: Lease): string {
    if (lease.property) {
      return this.propertyUtils.getImageUrl(lease.property);
    }
    return 'url(/assets/images/property-placeholder.jpg)';
  }

  getPropertyAddress(lease: Lease): string {
    if (lease.property) {
      return this.propertyUtils.getAddress(lease.property);
    }
    return '';
  }

  getPropertyArea(lease: Lease): number {
    if (lease.property) {
      return this.propertyUtils.getArea(lease.property);
    }
    return 0;
  }

  openTerminationModal(leaseId: string): void {
    this.selectedLeaseId = leaseId;
    this.isModalOpen = true;
    this.terminationForm.reset();
  }

  closeTerminationModal(): void {
    this.isModalOpen = false;
    this.selectedLeaseId = '';
  }

  submitTerminationRequest(): void {
    if (!this.selectedLeaseId || !this.terminationForm.valid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const reason = this.terminationForm.value.reason;
    const moveOutDate = this.terminationForm.value.moveOutDate;

    this.propertyService.requestTermination(
      this.selectedLeaseId,
      reason,
      moveOutDate
    ).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.isModalOpen = false;

        // Update the lease in the list
        this.leases = this.leases.map(lease => {
          if (lease._id === this.selectedLeaseId) {
            return {
              ...lease,
              terminationRequested: true,
              terminationDetails: {
                requestedBy: 'tenant',
                requestDate: new Date().toISOString(),
                reason: this.terminationForm.value.reason,
                moveOutDate: this.terminationForm.value.moveOutDate
              }
            };
          }
          return lease;
        });

        this.terminationForm.reset();
        this.selectedLeaseId = '';
        this.successMessage = 'Termination request submitted successfully.';

        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error.message || 'Failed to submit termination request.';

        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  }

  getRemainingDays(endDate: string): number {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
