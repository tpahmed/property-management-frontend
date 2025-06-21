import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PropertyService } from '../../../services/property';
import { Property } from '../../../models/property.model';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './property-detail.html',
  styleUrls: ['./property-detail.scss']
})
export class PropertyDetailComponent implements OnInit {
  propertyForm: FormGroup;
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  propertyId: string | null = null;
  isNewProperty = true;
  isEditMode = true; // Default to edit mode

  propertyTypes = [
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
    { value: 'condo', label: 'Condo' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'commercial', label: 'Commercial' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private propertyService: PropertyService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.propertyForm = this.formBuilder.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      address: this.formBuilder.group({
        street: ['', [Validators.required]],
        city: ['', [Validators.required]],
        state: ['', [Validators.required]],
        zipCode: ['', [Validators.required]],
        country: ['USA', [Validators.required]]
      }),
      propertyType: ['apartment', [Validators.required]],
      bedrooms: [1, [Validators.required, Validators.min(0)]],
      bathrooms: [1, [Validators.required, Validators.min(0)]],
      squareFeet: [0, [Validators.required, Validators.min(0)]],
      rentAmount: [0, [Validators.required, Validators.min(0)]],
      securityDeposit: [0, [Validators.required, Validators.min(0)]],
      availableDate: ['', [Validators.required]],
      isAvailable: [true],
      amenities: [[]]
    });
  }

  ngOnInit(): void {
    // Get the property ID from the route parameter
    this.propertyId = this.route.snapshot.paramMap.get('id');

    // Check if we're in edit mode by examining the URL
    const url = this.router.url;
    this.isEditMode = url.includes('/edit') || url.includes('/new');

    if (this.propertyId && this.propertyId !== 'new') {
      this.isNewProperty = false;
      this.loadProperty(this.propertyId);
    }
  }

  loadProperty(id: string): void {
    this.isLoading = true;

    this.propertyService.getPropertyById(id).subscribe({
      next: (response) => {
        const property = response.property;

        // Handle legacy address format
        if (typeof property.address === 'string') {
          // If address is a string, try to extract components or use defaults
          const addressStr = property.address as string;
          const addressParts = addressStr.split(',').map((part: string) => part.trim());

          this.propertyForm.patchValue({
            ...property,
            address: {
              street: property.city ? addressStr : (addressParts[0] || ''),
              city: property.city || (addressParts[1] || ''),
              state: property.state || (addressParts[2] || ''),
              zipCode: property.zipCode || (addressParts[3] || ''),
              country: 'USA'
            }
          });
        } else {
          // Address is already an object
          this.propertyForm.patchValue(property);
        }

        // Handle availableDate/availableFrom
        if (property.availableFrom && !property.availableDate) {
          this.propertyForm.patchValue({ availableDate: property.availableFrom });
        }

        // Handle area/squareFeet
        if (property.area && !property.squareFeet) {
          this.propertyForm.patchValue({ squareFeet: property.area });
        }

        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load property details.';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.propertyForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const propertyData = { ...this.propertyForm.value };

    // Add owner ID from current user if it's a new property
    if (this.isNewProperty) {
      propertyData.ownerId = this.authService.currentUserValue?._id;
    }

    if (this.isNewProperty) {
      this.propertyService.createProperty(propertyData).subscribe({
        next: () => {
          this.router.navigate(['/properties']);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to create property.';
          this.isSubmitting = false;
        }
      });
    } else if (this.propertyId) {
      this.propertyService.updateProperty(this.propertyId, propertyData).subscribe({
        next: () => {
          this.router.navigate(['/properties']);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to update property.';
          this.isSubmitting = false;
        }
      });
    }
  }
}
