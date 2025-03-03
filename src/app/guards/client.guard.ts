// src/app/guards/client.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ClientGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const user = this.authService.currentUserValue;
    
    if (user && user.role === 'CLIENT') {
      return true;
    }
    
    // Redirect to login
    this.router.navigate(['/login']);
    return false;
  }
}