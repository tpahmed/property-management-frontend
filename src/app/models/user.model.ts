export interface User {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'tenant' | 'property_manager' | 'property_owner';
  phone?: string;
  isActive?: boolean;
  token?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'tenant' | 'property_manager' | 'property_owner';
  phone?: string;
}

export interface ErrorResponse {
  message: string;
  errors?: {
    msg: string;
    param: string;
    location: string;
  }[];
}
