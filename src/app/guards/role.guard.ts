import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const expectedRoles = route.data?.['roles'] as string[];
    const currentUser = this.authService.currentUserValue;

    if (currentUser && expectedRoles && expectedRoles.includes(currentUser.role)) {
      return true;
    }

    // User doesn't have the required role, redirect to dashboard
    return this.router.parseUrl('/dashboard');
  }
}
