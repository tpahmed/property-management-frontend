import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null;
  isMenuOpen = false;
  isLoggedIn = false;
  isUserDropdownOpen = false;
  currentUserName: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
      this.currentUserName = user ? `${user.firstName} ${user.lastName}` : 'User';
    });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleUserDropdown(): void {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  isPropertyOwner(): boolean {
    return this.currentUser?.role === 'property_owner';
  }

  isPropertyManager(): boolean {
    return this.currentUser?.role === 'property_manager';
  }

  isTenant(): boolean {
    return this.currentUser?.role === 'tenant';
  }

  isPropertyStaff(): boolean {
    return this.isPropertyOwner() || this.isPropertyManager();
  }

  getUserName(): string {
    if (!this.currentUser) {
      return '';
    }

    return `${this.currentUser.firstName} ${this.currentUser.lastName}` || this.currentUser.email?.split('@')[0] || 'User';
  }

  getUserRole(): string {
    if (!this.currentUser) return '';

    switch (this.currentUser.role) {
      case 'tenant':
        return 'Tenant';
      case 'property_owner':
        return 'Property Owner';
      case 'property_manager':
        return 'Property Manager';
      default:
        return '';
    }
  }
}
