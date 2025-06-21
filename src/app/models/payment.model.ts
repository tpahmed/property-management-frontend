export interface Payment {
  _id?: string;
  leaseId: string;
  tenantId: string;
  propertyId: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue' | 'canceled' | 'failed' | 'refunded' | 'completed';
  paymentType: 'rent' | 'deposit' | 'fee' | 'other';
  paymentMethod?: 'credit_card' | 'bank_transfer' | 'cash' | 'check' | 'other';
  paidDate?: string;
  paymentDate?: string;
  description?: string;
  notes?: string;
  transactionId?: string;
  lateFee?: number;
  isLateFee?: boolean;
  paymentDetails?: {
    cardNumber?: string;
    accountNumber?: string;
    paymentId?: string;
  };
  processorResponse?: string;
  failureReason?: string;
  refundDetails?: {
    date: string;
    amount: number;
    reason?: string;
  };
  property?: any;
  tenant?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentFilter {
  tenantId?: string;
  propertyId?: string;
  leaseId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaymentStatistics {
  total: number;
  paid: number;
  pending: number;
  overdue: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
}

export interface PaymentResponse {
  success: boolean;
  payment: Payment;
  message?: string;
}

export interface PaymentsResponse {
  success: boolean;
  payments: Payment[];
  total?: number;
  statistics?: PaymentStatistics;
  message?: string;
}
