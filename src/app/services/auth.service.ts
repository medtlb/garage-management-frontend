// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

interface User {
  id?: number;
  nom: string;
  email: string;
  role: string;
}

interface AuthResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:9090/api/auth';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          const user = this.getUserFromToken(response.token);
          if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);
          }
        })
      );
  }

  register(nom: string, email: string, password: string, role: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { nom, email, password, role });
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  private getUserFromStorage(): User | null {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  }

  private getUserFromToken(token: string): User | null {
    try {
      // Basic JWT decode (payload is in the second part of the token)
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      
      console.log('Full decoded token payload:', decodedPayload);
      
      // Spring Security typically stores roles differently
      let role = 'UNKNOWN';
      
      // Check multiple possible locations for role
      if (decodedPayload.role) {
        role = decodedPayload.role;
      } else if (decodedPayload.authorities) {
        // Spring Security often uses 'authorities'
        // Assuming the first authority is the role
        role = decodedPayload.authorities[0]?.authority || 
               decodedPayload.authorities[0] || 
               'UNKNOWN';
      } else if (decodedPayload.scope) {
        role = decodedPayload.scope;
      }
  
      // Remove 'ROLE_' prefix if present
      role = role.replace(/^ROLE_/, '');
      
      console.log('Extracted role:', role);
      
      return {
        id: decodedPayload.sub || decodedPayload.id,
        email: decodedPayload.sub || decodedPayload.email,
        nom: decodedPayload.nom || decodedPayload.name || '',
        role: role
      };
    } catch (error) {
      console.error('Error decoding token', error);
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }

  hasRole(role: string): boolean {
    return this.currentUserValue?.role === role;
  }
}