import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../../services/payment';
import { AuthService } from '../../../services/auth';
import { PropertyService } from '../../../services/property';
import { Payment } from '../../../models/payment.model';
import { Property } from '../../../models/property.model';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './list.html',
  styleUrls: ['./list.scss']
})
export class PaymentListComponent implements OnInit {
  payments: Array<Payment & { property?: Property }> = [];
  filteredPayments: Array<Payment & { property?: Property }> = [];
  isLoading = true;
  errorMessage = '';
  statusFilter: string = 'all';
  propertyFilter: string = 'all';
  monthFilter: string = 'all';
  properties: Property[] = [];
  userRole: string = '';

  // For statistics (owner/manager view)
  totalReceived: number = 0;
  totalPending: number = 0;
  totalOverdue: number = 0;

  // Month names for filtering
  months: { value: string, name: string }[] = [
    { value: 'all', name: 'All Months' },
    { value: '0', name: 'January' },
    { value: '1', name: 'February' },
    { value: '2', name: 'March' },
    { value: '3', name: 'April' },
    { value: '4', name: 'May' },
    { value: '5', name: 'June' },
    { value: '6', name: 'July' },
    { value: '7', name: 'August' },
    { value: '8', name: 'September' },
    { value: '9', name: 'October' },
    { value: '10', name: 'November' },
    { value: '11', name: 'December' }
  ];

  constructor(
    private paymentService: PaymentService,
    private authService: AuthService,
    private propertyService: PropertyService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser || !currentUser._id) {
      this.errorMessage = 'You must be logged in to view payments.';
      this.isLoading = false;
      return;
    }

    this.userRole = currentUser.role;

    // Different loading strategy based on user role
    if (currentUser.role === 'tenant') {
      this.loadTenantPayments(currentUser._id);
    } else if (currentUser.role === 'property_owner' || currentUser.role === 'property_manager') {
      this.loadPropertyManagerPayments(currentUser._id, currentUser.role);
    } else {
      this.errorMessage = 'Unauthorized role.';
      this.isLoading = false;
    }
  }

  loadTenantPayments(tenantId: string): void {
    this.paymentService.getTenantPayments(tenantId).subscribe({
      next: (response) => {
        this.payments = response.payments;
        this.filteredPayments = [...this.payments];
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load payments.';
        this.isLoading = false;
      }
    });
  }

  loadPropertyManagerPayments(userId: string, role: string): void {
    // First, get properties owned/managed by the user
    this.propertyService.getAllProperties(
      role === 'property_owner' ? { ownerId: userId } :
      role === 'property_manager' ? { managerId: userId } : {}
    ).subscribe({
      next: (propertiesResponse) => {
        this.properties = propertiesResponse.properties;

        if (this.properties.length === 0) {
          this.isLoading = false;
          return;
        }

        // Get payments for all properties
        const propertyIds = this.properties.map(property => property._id);
        const paymentRequests = propertyIds.map(propertyId =>
          propertyId ? this.paymentService.getPropertyPayments(propertyId).pipe(
            catchError(() => of({ payments: [] }))
          ) : of({ payments: [] })
        );

        forkJoin(paymentRequests).subscribe({
          next: (responses) => {
            // Flatten all payments into a single array
            const allPayments: Payment[] = [];
            responses.forEach(response => {
              allPayments.push(...response.payments);
            });

            // Map properties to payments
            this.payments = allPayments.map(payment => {
              const property = this.properties.find(p => p._id === payment.propertyId);
              return { ...payment, property };
            });

            this.filteredPayments = [...this.payments];
            this.calculateStatistics();
            this.isLoading = false;
          },
          error: (error) => {
            this.errorMessage = error.message || 'Failed to load payments.';
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

  calculateStatistics(): void {
    this.totalReceived = 0;
    this.totalPending = 0;
    this.totalOverdue = 0;

    this.payments.forEach(payment => {
      if (payment.status === 'paid') {
        this.totalReceived += payment.amount;
      } else if (payment.status === 'pending') {
        this.totalPending += payment.amount;
      } else if (payment.status === 'overdue') {
        this.totalOverdue += payment.amount;
      }
    });
  }

  applyFilters(): void {
    this.filteredPayments = this.payments.filter(payment => {
      // Status filter
      if (this.statusFilter !== 'all' && payment.status !== this.statusFilter) {
        return false;
      }

      // Property filter (only for property managers/owners)
      if (this.userRole !== 'tenant' && this.propertyFilter !== 'all' && payment.propertyId !== this.propertyFilter) {
        return false;
      }

      // Month filter
      if (this.monthFilter !== 'all') {
        const paymentDate = new Date(payment.dueDate);
        if (paymentDate.getMonth().toString() !== this.monthFilter) {
          return false;
        }
      }

      return true;
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'paid':
        return 'status-paid';
      case 'pending':
        return 'status-pending';
      case 'overdue':
        return 'status-overdue';
      case 'canceled':
        return 'status-canceled';
      default:
        return '';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatCurrency(amount: number): string {
    return amount.toFixed(2);
  }
}
