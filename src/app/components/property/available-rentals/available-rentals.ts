import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PropertyService } from '../../../services/property';
import { Property } from '../../../models/property.model';
import { AuthService } from '../../../services/auth';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-available-rentals',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './available-rentals.html',
  styleUrls: ['./available-rentals.scss']
})
export class AvailableRentalsComponent implements OnInit {
  properties: Property[] = [];
  isLoading = true;
  errorMessage = '';
  currentUser: User | null = null;

  constructor(
    private propertyService: PropertyService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.currentUser = this.authService.currentUserValue;
    this.loadAvailableProperties();
  }

  loadAvailableProperties(): void {
    this.errorMessage = '';

    this.propertyService.getAvailableRentals().subscribe({
      next: (response) => {
        this.properties = response.properties;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load available properties.';
        this.isLoading = false;
      }
    });
  }

  viewPropertyDetails(propertyId: string): void {
    // Navigate to property application page
  }
}
