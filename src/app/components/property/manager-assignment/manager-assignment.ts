import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../../services/property';
import { AuthService } from '../../../services/auth';
import { Property } from '../../../models/property.model';
import { User } from '../../../models/user.model';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-manager-assignment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manager-assignment.html',
  styleUrls: ['./manager-assignment.scss']
})
export class ManagerAssignmentComponent implements OnInit {
  properties: Property[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  // Form data
  selectedPropertyId: string = '';
  searchQuery: string = '';
  searchSubject = new Subject<string>();

  // Manager search results
  managers: User[] = [];
  isSearching = false;
  selectedManager: User | null = null;

  // Current manager data for display
  currentManagers: { [propertyId: string]: string } = {};

  constructor(
    private propertyService: PropertyService,
    private authService: AuthService
  ) {
    // Set up search debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchManagers(query);
    });
  }

  ngOnInit(): void {
    this.loadOwnerProperties();
  }

  loadOwnerProperties(): void {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser || !currentUser._id || currentUser.role !== 'property_owner') {
      this.errorMessage = 'You must be logged in as a property owner to manage properties.';
      this.isLoading = false;
      return;
    }

    this.propertyService.getAllProperties({ ownerId: currentUser._id }).subscribe({
      next: (response) => {
        this.properties = response.properties;
        this.isLoading = false;

        // Load current manager info for each property
        this.properties.forEach(property => {
          if (property.managerId) {
            this.loadManagerInfo(property._id || '', property.managerId);
          }
        });
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load properties.';
        this.isLoading = false;
      }
    });
  }

  loadManagerInfo(propertyId: string, managerId: string): void {
    this.authService.getUserById(managerId).subscribe({
      next: (response) => {
        if (response && response.email) {
          this.currentManagers[propertyId] = `${response.firstName} ${response.lastName} (${response.email})`;
        }
      },
      error: () => {
        this.currentManagers[propertyId] = 'Unknown manager';
      }
    });
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  searchManagers(query: string): void {
    if (!query || query.trim().length < 2) {
      this.managers = [];
      return;
    }

    this.isSearching = true;
    this.authService.searchManagers(query).subscribe({
      next: (managers) => {
        this.managers = managers;
        this.isSearching = false;
      },
      error: () => {
        this.managers = [];
        this.isSearching = false;
      }
    });
  }

  selectManager(manager: User): void {
    this.selectedManager = manager;
    this.searchQuery = `${manager.firstName} ${manager.lastName} (${manager.email})`;
    this.managers = []; // Clear search results
  }

  assignManager(): void {
    if (!this.selectedPropertyId || !this.selectedManager?._id) {
      this.errorMessage = 'Please select a property and a manager.';
      return;
    }

    // Reset messages
    this.errorMessage = '';
    this.successMessage = '';

    this.propertyService.assignManager(this.selectedPropertyId, this.selectedManager._id).subscribe({
      next: (response) => {
        this.successMessage = 'Manager assigned successfully.';

        // Update the current manager display
        this.currentManagers[this.selectedPropertyId] = `${this.selectedManager!.firstName} ${this.selectedManager!.lastName} (${this.selectedManager!.email})`;

        // Reset form
        this.searchQuery = '';
        this.selectedManager = null;

        // Refresh the properties list
        this.loadOwnerProperties();
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to assign manager.';
      }
    });
  }

  removeManager(propertyId: string): void {
    if (!confirm('Are you sure you want to remove this manager from the property?')) {
      return;
    }

    // Reset messages
    this.errorMessage = '';
    this.successMessage = '';

    this.propertyService.removeManager(propertyId).subscribe({
      next: (response) => {
        this.successMessage = 'Manager removed successfully.';

        // Update the current manager display
        delete this.currentManagers[propertyId];

        // Refresh the properties list
        this.loadOwnerProperties();
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to remove manager.';
      }
    });
  }
}
