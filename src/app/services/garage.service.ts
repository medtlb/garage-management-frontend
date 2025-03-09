import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Garage } from '../models/garage';

@Injectable({
  providedIn: 'root'
})
export class GarageService {
  private apiUrl = 'http://localhost:9090/api/garage';

  constructor(private http: HttpClient) { }

  getAllGarages(): Observable<Garage[]> {
    return this.http.get<Garage[]>(this.apiUrl).pipe(
      tap(garages => console.log('Received garages:', garages)),
      catchError(this.handleError)
    );
  }

  getGarageById(id: number): Observable<Garage> {
    return this.http.get<Garage>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  add(garage: Garage): Observable<number> {
    console.log('Adding garage:', garage);
    return this.http.post<number>(this.apiUrl, garage).pipe(
      tap(id => console.log(`Added garage with id: ${id}`)),
      catchError(this.handleError)
    );
  }

  update(garage: Garage, id: number): Observable<number> {
    console.log('Updating garage:', garage);
    return this.http.put<number>(`${this.apiUrl}/${id}`, garage).pipe(
      tap(updatedId => console.log(`Updated garage with id: ${updatedId}`)),
      catchError(this.handleError)
    );
  }

  deleteById(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => console.log(`Deleted garage with id: ${id}`)),
      catchError(this.handleError)
    );
  }

  private handleError = (error: HttpErrorResponse) => {
    console.error('Detailed error:', error);
    
    let errorMessage = 'Unable to process request. Please try again later.';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = error.error.message;
    } else {
      // Backend returned an unsuccessful response code
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.status) {
        errorMessage = `Server returned code ${error.status}`;
      }
    }
    
    // Log the full error for debugging
    console.error('Full error details:', error);
    
    // Return an observable with a user-facing error message
    return throwError(() => new Error(errorMessage));
  }
}