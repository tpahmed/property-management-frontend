import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.currentUserValue;

    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Redirect to appropriate dashboard based on role
    if (currentUser.role === 'tenant') {
      this.router.navigate(['/tenant-dashboard']);
    }
  }
}
