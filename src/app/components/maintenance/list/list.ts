import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaintenanceService } from '../../../services/maintenance';
import { MaintenanceRequest } from '../../../models/maintenance.model';
import { AuthService } from '../../../services/auth';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-maintenance-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './list.html',
  styleUrls: ['./list.scss']
})
export class ListComponent implements OnInit {
  maintenanceRequests: MaintenanceRequest[] = [];
  filteredRequests: MaintenanceRequest[] = [];
  isLoading = false;
  currentUser: User | null = null;

  constructor(
    private maintenanceService: MaintenanceService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.currentUser = this.authService.currentUserValue;

    this.maintenanceService.getAllRequests().subscribe({
      next: (response) => {
        this.maintenanceRequests = response.requests;
        this.filteredRequests = [...this.maintenanceRequests];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  filterByStatus(event: Event): void {
    const status = (event.target as HTMLSelectElement).value;

    if (status === 'all') {
      this.filteredRequests = [...this.maintenanceRequests];
    } else {
      this.filteredRequests = this.maintenanceRequests.filter(request => request.status === status);
    }
  }

  filterByPriority(event: Event): void {
    const priority = (event.target as HTMLSelectElement).value;

    if (priority === 'all') {
      this.filteredRequests = [...this.maintenanceRequests];
    } else {
      this.filteredRequests = this.maintenanceRequests.filter(request => request.priority === priority);
    }
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
