import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  // Auth routes
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/auth/register/register').then(m => m.RegisterComponent)
  },

  // Dashboard routes
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },

  // Property routes
  {
    path: 'properties',
    loadComponent: () => import('./components/property/property-list/property-list').then(m => m.PropertyListComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['property_owner', 'property_manager', 'admin'] }
  },
  {
    path: 'properties/new',
    loadComponent: () => import('./components/property/property-detail/property-detail').then(m => m.PropertyDetailComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['property_owner', 'admin'] }
  },
  {
    path: 'properties/:id/edit',
    loadComponent: () => import('./components/property/property-detail/property-detail').then(m => m.PropertyDetailComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['property_owner', 'property_manager', 'admin'] }
  },
  {
    path: 'properties/:id',
    loadComponent: () => import('./components/property/property-detail/property-detail').then(m => m.PropertyDetailComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['property_owner', 'property_manager', 'admin'] }
  },
  {
    path: 'properties/:id/view',
    loadComponent: () => import('./components/property/property-view/property-view').then(m => m.PropertyViewComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'available-rentals',
    loadComponent: () => import('./components/property/available-rentals/available-rentals').then(m => m.AvailableRentalsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'properties/:id/apply',
    loadComponent: () => import('./components/property/property-application/property-application').then(m => m.PropertyApplicationComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['tenant'] }
  },
  {
    path: 'applications',
    loadComponent: () => import('./components/property/applications-management/applications-management').then(m => m.ApplicationsManagementComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['property_owner', 'property_manager'] }
  },
  {
    path: 'leases',
    loadComponent: () => import('./components/property/leases-management/leases-management').then(m => m.LeasesManagementComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['property_owner', 'property_manager'] }
  },
  {
    path: 'managers',
    loadComponent: () => import('./components/property/manager-assignment/manager-assignment').then(m => m.ManagerAssignmentComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['property_owner'] }
  },

  // Tenant routes
  {
    path: 'my-applications',
    loadComponent: () => import('./components/tenant/my-applications/my-applications').then(m => m.MyApplicationsComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['tenant'] }
  },
  {
    path: 'my-leases',
    loadComponent: () => import('./components/tenant/my-leases/my-leases').then(m => m.MyLeasesComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['tenant'] }
  },
  {
    path: 'tenant-dashboard',
    loadComponent: () => import('./components/tenant/tenant-dashboard/tenant-dashboard').then(m => m.TenantDashboardComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['tenant'] }
  },

  // Maintenance routes
  {
    path: 'maintenance',
    loadComponent: () => import('./components/maintenance/maintenance-list/maintenance-list').then(m => m.MaintenanceListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'maintenance/new',
    loadComponent: () => import('./components/maintenance/detail/detail').then(m => m.DetailComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['tenant'] }
  },
  {
    path: 'maintenance/:id',
    loadComponent: () => import('./components/maintenance/detail/detail').then(m => m.DetailComponent),
    canActivate: [AuthGuard]
  },

  // Payment routes
  {
    path: 'payments',
    loadComponent: () => import('./components/payment/list/list').then(m => m.PaymentListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'payments/new',
    loadComponent: () => import('./components/payment/detail/detail').then(m => m.DetailComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['tenant'] }
  },
  {
    path: 'payments/:id',
    loadComponent: () => import('./components/payment/detail/detail').then(m => m.DetailComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'payments/pay/:id',
    loadComponent: () => import('./components/payment/detail/detail').then(m => m.DetailComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['tenant'] }
  },

  // Default routes
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
