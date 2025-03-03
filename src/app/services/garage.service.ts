import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Garage } from '../models/garage';

@Injectable({
  providedIn: 'root'
})
export class GarageService {
  private apiUrl = 'http://localhost:9090/api/garage';

  constructor(private http: HttpClient) { }

  getAllGarages(): Observable<Garage[]> {
    return this.http.get<Garage[]>(this.apiUrl).pipe(
      map(garages => {
        console.log('Received garages:', garages);
        return garages;
      }),
      catchError(this.handleError)
    );
  }

  private handleError = (error: HttpErrorResponse) => {
    console.error('Detailed error:', error);
    
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      console.error('Client-side error:', error.error.message);
    } else {
      // Backend returned an unsuccessful response code
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${JSON.stringify(error.error)}`
      );
    }
    
    // Return an observable with a user-facing error message
    return throwError(() => new Error('Unable to load garages. Please try again later.'));
  }

  getGarageById(id: number): Observable<Garage> {
    return this.http.get<Garage>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }
}