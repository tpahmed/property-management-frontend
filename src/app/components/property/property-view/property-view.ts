import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { PropertyService } from '../../../services/property';
import { AuthService } from '../../../services/auth';
import { Property } from '../../../models/property.model';

@Component({
  selector: 'app-property-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './property-view.html',
  styleUrls: ['./property-view.scss']
})
export class PropertyViewComponent implements OnInit {
  propertyId: string = '';
  property: Property | null = null;
  isLoading = true;
  errorMessage = '';
  isLoggedIn = false;
  isTenant = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private propertyService: PropertyService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.propertyId = params['id'];
      this.loadProperty();
    });

    const currentUser = this.authService.currentUserValue;
    this.isLoggedIn = !!currentUser;
    this.isTenant = currentUser?.role === 'tenant';
  }

  loadProperty(): void {
    this.isLoading = true;
    this.errorMessage = '';

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

  applyForProperty(): void {
    this.router.navigate(['/properties', this.propertyId, 'apply']);
  }

  goBack(): void {
    this.router.navigate(['/available-rentals']);
  }
}
