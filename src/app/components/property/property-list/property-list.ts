import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PropertyService } from '../../../services/property';
import { AuthService } from '../../../services/auth';
import { PropertyUtilsService } from '../../../services/property-utils';
import { Property } from '../../../models/property.model';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './property-list.html',
  styleUrls: ['./property-list.scss']
})
export class PropertyListComponent implements OnInit {
  properties: Property[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private propertyService: PropertyService,
    private authService: AuthService,
    private propertyUtils: PropertyUtilsService
  ) {}

  ngOnInit(): void {
    this.loadProperties();
  }

  loadProperties(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      this.errorMessage = 'You must be logged in to view properties.';
      this.isLoading = false;
      return;
    }

    // Get properties based on user role
    if (currentUser.role === 'property_owner') {
      this.propertyService.getOwnerProperties(currentUser._id || '').subscribe({
        next: (response) => {
          this.properties = response.properties;
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to load properties.';
          this.isLoading = false;
        }
      });
    } else if (currentUser.role === 'property_manager') {
      this.propertyService.getManagedProperties(currentUser._id || '').subscribe({
        next: (response) => {
          this.properties = response.properties;
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to load properties.';
          this.isLoading = false;
        }
      });
    } else {
      this.errorMessage = 'You do not have permission to view properties.';
      this.isLoading = false;
    }
  }

  getPropertyImageUrl(property: Property): string {
    return this.propertyUtils.getImageUrl(property);
  }

  getPropertyAddress(property: Property): string {
    return this.propertyUtils.getAddress(property);
  }

  getPropertyArea(property: Property): number {
    return this.propertyUtils.getArea(property);
  }
}
