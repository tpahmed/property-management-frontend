export interface Property {
  _id?: string;
  title: string;
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  };
  propertyType: 'apartment' | 'house' | 'condo' | 'townhouse' | 'commercial';
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  rentAmount: number;
  securityDeposit: number;
  availableDate: string;
  isAvailable: boolean;
  amenities?: string[];
  images?: {
    url: string;
    caption?: string;
  }[];
  ownerId: string;
  managerId?: string;
  createdAt?: string;
  updatedAt?: string;

  // Legacy fields for backward compatibility
  area?: number; // Use squareFeet instead
  city?: string; // Use address.city instead
  state?: string; // Use address.state instead
  zipCode?: string; // Use address.zipCode instead
  availableFrom?: string; // Use availableDate instead
}

export interface RentalApplication {
  _id?: string;
  propertyId: string;
  tenantId: string;
  moveInDate: string;
  leaseTerm: number;
  status: 'pending' | 'approved' | 'rejected' | 'canceled';
  employmentInfo: {
    employer: string;
    position: string;
    monthlyIncome: number;
    employmentLength: number;
  };
  creditScore?: number;
  previousRentals?: {
    address: string;
    landlordName: string;
    landlordContact: string;
    rentalDuration: number;
  }[];
  references?: {
    name: string;
    relationship: string;
    contact: string;
  }[];
  additionalNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  property?: Property;
  createdAt?: string;
  updatedAt?: string;
}

export interface Lease {
  _id?: string;
  propertyId: string;
  tenantId: string;
  ownerId: string;
  managerId?: string;
  applicationId?: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  securityDeposit: number;
  isActive: boolean;
  paymentDueDay: number;
  lateFeesApplicable: boolean;
  lateFeeAmount: number;
  lateFeeApplicableAfterDays: number;
  renewalOffered?: boolean;
  renewalDetails?: {
    offeredAt: string;
    newRentAmount: number;
    newTermLength: number;
    status: 'pending' | 'accepted' | 'rejected' | 'expired';
    responseDate?: string;
  };
  terminationRequested?: boolean;
  terminationDetails?: {
    requestedBy: 'tenant' | 'owner' | 'manager';
    requestDate: string;
    reason: string;
    approvedBy?: string;
    approvedDate?: string;
    moveOutDate: string;
  };
  documents?: {
    title: string;
    url: string;
    uploadedAt: string;
  }[];
  specialTerms?: string;
  property?: Property;
  createdAt?: string;
  updatedAt?: string;
}

export interface PropertyFilter {
  page?: number;
  limit?: number;
  minRent?: number;
  maxRent?: number;
  bedrooms?: number;
  propertyType?: string;
  city?: string;
  state?: string;
  isAvailable?: boolean;
  ownerId?: string;
  managerId?: string;
}

export interface PropertyResponse {
  success: boolean;
  property: Property;
  message?: string;
}

export interface PropertiesResponse {
  success: boolean;
  properties: Property[];
  totalPages?: number;
  currentPage?: number;
  totalCount?: number;
  message?: string;
}

export interface ApplicationResponse {
  success: boolean;
  application: RentalApplication;
  message?: string;
}

export interface ApplicationsResponse {
  success: boolean;
  applications: RentalApplication[];
  total?: number;
  message?: string;
}

export interface LeaseResponse {
  success: boolean;
  lease: Lease;
  message?: string;
}

export interface LeasesResponse {
  success: boolean;
  leases: Lease[];
  total?: number;
  message?: string;
}

export interface ManagerAssignment {
  propertyId: string;
  managerEmail: string;
}
