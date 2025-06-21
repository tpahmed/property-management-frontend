import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaintenanceService } from '../../../services/maintenance';
import { MaintenanceRequest } from '../../../models/maintenance.model';
import { AuthService } from '../../../services/auth';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-maintenance-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './detail.html',
  styleUrls: ['./detail.scss']
})
export class DetailComponent implements OnInit {
  maintenanceForm: FormGroup;
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  requestId: string | null = null;
  isNewRequest = true;
  maintenanceRequest: MaintenanceRequest | null = null;
  currentUser: User | null = null;
  showRatingForm = false;
  showNoteForm = false;

  categories = [
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'appliance', label: 'Appliance' },
    { value: 'heating_cooling', label: 'Heating/Cooling' },
    { value: 'structural', label: 'Structural' },
    { value: 'pest_control', label: 'Pest Control' },
    { value: 'other', label: 'Other' }
  ];

  priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'emergency', label: 'Emergency' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private maintenanceService: MaintenanceService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.maintenanceForm = this.formBuilder.group({
      propertyId: ['', [Validators.required]],
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      category: ['', [Validators.required]],
      priority: ['medium', [Validators.required]],
      preferredAvailability: [''],
      permissionToEnter: [false]
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.requestId = this.route.snapshot.paramMap.get('id');

    if (this.requestId) {
      this.isNewRequest = false;
      this.loadMaintenanceRequest(this.requestId);
    }
  }

  loadMaintenanceRequest(id: string): void {
    this.isLoading = true;

    this.maintenanceService.getRequestById(id).subscribe({
      next: (response) => {
        this.maintenanceRequest = response.request;
        this.maintenanceForm.patchValue(response.request);
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load maintenance request details.';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.maintenanceForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const requestData = this.maintenanceForm.value;

    // Add tenant ID from current user
    requestData.tenantId = this.authService.currentUserValue?._id;

    if (this.isNewRequest) {
      this.maintenanceService.createRequest(requestData).subscribe({
        next: () => {
          this.router.navigate(['/maintenance']);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to create maintenance request.';
          this.isSubmitting = false;
        }
      });
    }
  }

  updateStatus(status: string): void {
    if (!this.requestId) return;

    this.isSubmitting = true;

    this.maintenanceService.updateRequestStatus(this.requestId, status).subscribe({
      next: () => {
        this.loadMaintenanceRequest(this.requestId!);
        this.isSubmitting = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to update status.';
        this.isSubmitting = false;
      }
    });
  }

  addNote(text: string, isPublic: boolean = true): void {
    if (!this.requestId) return;

    this.isSubmitting = true;

    this.maintenanceService.addNote(this.requestId, text, isPublic).subscribe({
      next: () => {
        this.loadMaintenanceRequest(this.requestId!);
        this.isSubmitting = false;
        this.showNoteForm = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to add note.';
        this.isSubmitting = false;
      }
    });
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

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'assigned':
        return 'status-assigned';
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
}
