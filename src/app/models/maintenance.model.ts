export interface MaintenanceRequest {
  _id?: string;
  propertyId: string;
  tenantId: string;
  title: string;
  description: string;
  category: 'plumbing' | 'electrical' | 'appliance' | 'heating_cooling' | 'structural' | 'pest_control' | 'other';
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'canceled';
  preferredAvailability?: string;
  permissionToEnter?: boolean;
  images?: {
    url: string;
    caption?: string;
  }[];
  assignedTo?: string;
  assignedAt?: string;
  scheduledDate?: string;
  completedAt?: string;
  notes?: {
    text: string;
    addedBy: string;
    addedAt: string;
    isPublic: boolean;
  }[];
  cost?: {
    amount: number;
    currency: string;
    details?: string;
  };
  rating?: {
    score: number;
    comment?: string;
    ratedAt?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Maintenance {
  _id?: string;
  propertyId: string;
  tenantId: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'pending' | 'in_progress' | 'completed' | 'canceled';
  unit?: string;
  permissionToEnter?: boolean;
  availableTimes?: string;
  images?: string[];
  assignedTo?: string;
  scheduledDate?: string;
  completedDate?: string;
  cost?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
