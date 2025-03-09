import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface Reservation {
  id?: number;
  garageId: number;
  voitureId: number;
  dateReservation: string;
  description?: string;
  status?: string;
  prixEstime?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = 'http://localhost:9090/api/reservation';
  private disponibiliteUrl = 'http://localhost:9090/api/disponibilite';

  constructor(private http: HttpClient) { }

  // Get all reservations - for admin
  getAll(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

  // Get current user's reservations
  getUserReservations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user`);
  }

  getReservationById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createReservation(reservation: Reservation): Observable<any> {
    console.log('Service sending reservation:', reservation);
    return this.http.post(this.apiUrl, reservation).pipe(
      tap(response => console.log('API response:', response)),
      catchError(error => {
        console.error('API error:', error);
        return throwError(() => error);
      })
    );
  }

  updateReservation(id: number, reservation: Reservation): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, reservation);
  }
  
  updateReservationStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/status`, { status });
  }

  deleteReservation(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Add this method to your service
  getGarageAvailabilities(garageId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.disponibiliteUrl}/garage/${garageId}`);
  }
}