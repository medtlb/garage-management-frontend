import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  userName: string = '';
  activeTab: 'garages' | 'reservations' = 'garages';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is an admin
    const user = this.authService.currentUserValue;
    if (!user || user.role !== 'ADMIN') {
      this.router.navigate(['/login']);
      return;
    }

    // Set user name
    this.userName = user.nom || 'Admin';
  }

  setActiveTab(tab: 'garages' | 'reservations'): void {
    this.activeTab = tab;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}