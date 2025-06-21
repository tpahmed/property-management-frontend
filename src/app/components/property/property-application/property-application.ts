import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PropertyService } from '../../../services/property';
import { AuthService } from '../../../services/auth';
import { Property, RentalApplication } from '../../../models/property.model';

@Component({
  selector: 'app-property-application',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './property-application.html',
  styleUrls: ['./property-application.scss']
})
export class PropertyApplicationComponent implements OnInit {
  propertyId: string = '';
  property: Property | null = null;
  applicationForm: FormGroup;
  isLoading = true;
  isSubmitting = false;
  isSubmitted = false;
  errorMessage = '';
  applicationId = '';
  currentUser: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private propertyService: PropertyService,
    private authService: AuthService
  ) {
    this.applicationForm = this.formBuilder.group({
      moveInDate: ['', Validators.required],
      leaseTerm: ['12', Validators.required],
      employer: ['', Validators.required],
      position: ['', Validators.required],
      monthlyIncome: ['', [Validators.required, Validators.min(0)]],
      employmentLength: ['', [Validators.required, Validators.min(0)]],
      creditScore: [''],
      additionalNotes: ['']
    });

    this.currentUser = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    this.propertyId = this.route.snapshot.paramMap.get('id') || '';
    this.loadProperty();
  }

  loadProperty(): void {
    if (!this.propertyId) {
      this.errorMessage = 'Property ID is missing.';
      this.isLoading = false;
      return;
    }

    this.propertyService.getPropertyById(this.propertyId).subscribe({
      next: (response) => {
        this.property = response.property;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load property details.';
        this.isLoading = false;
      }
    });
  }

  submitApplication(): void {
    if (this.applicationForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const application: RentalApplication = {
      propertyId: this.propertyId,
      tenantId: this.currentUser?._id || '',
      moveInDate: this.applicationForm.value.moveInDate,
      leaseTerm: this.applicationForm.value.leaseTerm,
      status: 'pending',
      creditScore: this.applicationForm.value.creditScore,
      employmentInfo: {
        employer: this.applicationForm.value.employer,
        position: this.applicationForm.value.position,
        monthlyIncome: this.applicationForm.value.monthlyIncome,
        employmentLength: this.applicationForm.value.employmentLength
      },
      additionalNotes: this.applicationForm.value.additionalNotes
    };

    this.propertyService.submitApplication(application).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.isSubmitted = true;
        this.applicationId = response.application._id || '';
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error.error?.message || 'Failed to submit application. Please try again.';
      }
    });
  }
}
