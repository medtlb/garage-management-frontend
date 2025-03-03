// src/app/components/login/login.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  error = '';
  loading = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Initialize form
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    
    // Redirect if already logged in
    if (this.authService.currentUserValue) {
      this.redirectBasedOnRole();
    }
  }

  get f() { 
    return this.loginForm.controls; 
  }

  onSubmit() {
    // ... existing code ...
    this.authService.login(this.f['email'].value, this.f['password'].value)
      .subscribe({
        next: (response) => {
          console.log('Full login response:', response);
          const user = this.authService.currentUserValue;
          console.log('Decoded user:', user);
          this.redirectBasedOnRole();
        },
        error: error => {
          console.error('Full login error:', error);
          this.error = error.error || 'Login failed. Please check your credentials.';
          this.loading = false;
        }
      });
  }
  private redirectBasedOnRole() {
    const user = this.authService.currentUserValue;
    console.log('Current user:', user);
    
    if (user?.role === 'CLIENT') {
      this.router.navigate(['/map']);
    } else if (user?.role === 'ADMIN') {
      alert('Welcome Admin! Admin dashboard is not implemented yet.');
    } else {
      // Log details for debugging
      console.log('User role not recognized:', user?.role);
      alert(`Login successful but your role (${user?.role}) does not have access.`);
    }
  }
}