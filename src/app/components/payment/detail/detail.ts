import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PaymentService } from '../../../services/payment';
import { Payment } from '../../../models/payment.model';
import { AuthService } from '../../../services/auth';
import { User } from '../../../models/user.model';
import { Property } from '../../../models/property.model';
import { PropertyService } from '../../../services/property';

@Component({
  selector: 'app-payment-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './detail.html',
  styleUrls: ['./detail.scss']
})
export class DetailComponent implements OnInit {
  paymentForm: FormGroup;
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  paymentId: string | null = null;
  isNewPayment = true;
  payment: Payment | null = null;
  currentUser: User | null = null;
  properties: Property[] = [];

  paymentTypes = [
    { value: 'rent', label: 'Rent' },
    { value: 'security_deposit', label: 'Security Deposit' },
    { value: 'late_fee', label: 'Late Fee' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'other', label: 'Other' }
  ];

  paymentMethods = [
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cash', label: 'Cash' },
    { value: 'check', label: 'Check' },
    { value: 'other', label: 'Other' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private paymentService: PaymentService,
    private propertyService: PropertyService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.paymentForm = this.formBuilder.group({
      propertyId: ['', [Validators.required]],
      paymentType: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      description: ['', [Validators.required]],
      dueDate: ['', [Validators.required]],
      paymentMethod: ['', [Validators.required]],
      // Credit card fields
      cardNumber: [''],
      cardName: [''],
      expiryDate: [''],
      cvv: [''],
      // Bank transfer fields
      accountName: [''],
      accountNumber: [''],
      routingNumber: ['']
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.paymentId = this.route.snapshot.paramMap.get('id');

    if (this.paymentId) {
      this.isNewPayment = false;
      this.loadPaymentDetails(this.paymentId);
    } else {
      this.loadProperties();

      // Add conditional validators based on payment method
      this.paymentForm.get('paymentMethod')?.valueChanges.subscribe(method => {
        if (method === 'credit_card') {
          this.paymentForm.get('cardNumber')?.setValidators([Validators.required]);
          this.paymentForm.get('cardName')?.setValidators([Validators.required]);
          this.paymentForm.get('expiryDate')?.setValidators([Validators.required]);
          this.paymentForm.get('cvv')?.setValidators([Validators.required]);

          this.paymentForm.get('accountName')?.clearValidators();
          this.paymentForm.get('accountNumber')?.clearValidators();
          this.paymentForm.get('routingNumber')?.clearValidators();
        } else if (method === 'bank_transfer') {
          this.paymentForm.get('accountName')?.setValidators([Validators.required]);
          this.paymentForm.get('accountNumber')?.setValidators([Validators.required]);
          this.paymentForm.get('routingNumber')?.setValidators([Validators.required]);

          this.paymentForm.get('cardNumber')?.clearValidators();
          this.paymentForm.get('cardName')?.clearValidators();
          this.paymentForm.get('expiryDate')?.clearValidators();
          this.paymentForm.get('cvv')?.clearValidators();
        } else {
          this.paymentForm.get('cardNumber')?.clearValidators();
          this.paymentForm.get('cardName')?.clearValidators();
          this.paymentForm.get('expiryDate')?.clearValidators();
          this.paymentForm.get('cvv')?.clearValidators();
          this.paymentForm.get('accountName')?.clearValidators();
          this.paymentForm.get('accountNumber')?.clearValidators();
          this.paymentForm.get('routingNumber')?.clearValidators();
        }

        // Update validation status
        this.paymentForm.get('cardNumber')?.updateValueAndValidity();
        this.paymentForm.get('cardName')?.updateValueAndValidity();
        this.paymentForm.get('expiryDate')?.updateValueAndValidity();
        this.paymentForm.get('cvv')?.updateValueAndValidity();
        this.paymentForm.get('accountName')?.updateValueAndValidity();
        this.paymentForm.get('accountNumber')?.updateValueAndValidity();
        this.paymentForm.get('routingNumber')?.updateValueAndValidity();
      });
    }
  }

  loadProperties(): void {
    this.isLoading = true;

    this.propertyService.getAllProperties().subscribe({
      next: (response) => {
        this.properties = response.properties;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load properties.';
        this.isLoading = false;
      }
    });
  }

  loadPaymentDetails(id: string): void {
    this.isLoading = true;

    this.paymentService.getPaymentById(id).subscribe({
      next: (response) => {
        this.payment = response.payment;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load payment details.';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.paymentForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const paymentData = this.preparePaymentData();

    this.paymentService.createPayment(paymentData).subscribe({
      next: () => {
        this.router.navigate(['/payments']);
      },
      error: (error: any) => {
        this.errorMessage = error.error?.message || 'Failed to process payment.';
        this.isSubmitting = false;
      }
    });
  }

  preparePaymentData(): any {
    const formData = this.paymentForm.value;
    const paymentData: any = {
      propertyId: formData.propertyId,
      paymentType: formData.paymentType,
      amount: formData.amount,
      description: formData.description,
      dueDate: formData.dueDate,
      paymentMethod: formData.paymentMethod,
      status: 'pending',
      tenantId: this.currentUser?._id
    };

    // Add payment details based on method
    if (formData.paymentMethod === 'credit_card') {
      paymentData.paymentDetails = {
        cardNumber: formData.cardNumber,
        cardName: formData.cardName,
        expiryDate: formData.expiryDate
      };
    } else if (formData.paymentMethod === 'bank_transfer') {
      paymentData.paymentDetails = {
        accountName: formData.accountName,
        accountNumber: formData.accountNumber,
        routingNumber: formData.routingNumber
      };
    }

    return paymentData;
  }

  processPayment(): void {
    if (!this.payment?._id) return;

    this.isSubmitting = true;

    this.paymentService.processPayment(this.payment._id).subscribe({
      next: () => {
        if (this.payment?._id) {
          this.loadPaymentDetails(this.payment._id);
        }
        this.isSubmitting = false;
      },
      error: (error: any) => {
        this.errorMessage = error.error?.message || 'Failed to process payment.';
        this.isSubmitting = false;
      }
    });
  }

  cancelPayment(): void {
    if (!this.payment?._id) return;

    this.isSubmitting = true;

    this.paymentService.cancelPayment(this.payment._id).subscribe({
      next: () => {
        this.router.navigate(['/payments']);
      },
      error: (error: any) => {
        this.errorMessage = error.error?.message || 'Failed to cancel payment.';
        this.isSubmitting = false;
      }
    });
  }

  refundPayment(): void {
    if (!this.payment?._id) return;

    this.isSubmitting = true;

    this.paymentService.refundPayment(this.payment._id).subscribe({
      next: () => {
        if (this.payment?._id) {
          this.loadPaymentDetails(this.payment._id);
        }
        this.isSubmitting = false;
      },
      error: (error: any) => {
        this.errorMessage = error.error?.message || 'Failed to refund payment.';
        this.isSubmitting = false;
      }
    });
  }

  downloadReceipt(): void {
    if (!this.payment?._id) return;

    this.paymentService.downloadReceipt(this.payment._id).subscribe({
      next: (response: Blob) => {
        // Handle receipt download
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `payment-receipt-${this.payment!._id}.pdf`;
        link.click();
      },
      error: () => {
        this.errorMessage = 'Failed to download receipt.';
      }
    });
  }

  canRefundPayment(): boolean {
    if (!this.payment || !this.currentUser) return false;

    // Only admin or landlord can refund payments
    return ['admin', 'landlord'].includes(this.currentUser.role) &&
           this.payment.status === 'completed';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'completed':
        return 'status-completed';
      case 'failed':
        return 'status-failed';
      case 'refunded':
        return 'status-refunded';
      default:
        return '';
    }
  }
}
