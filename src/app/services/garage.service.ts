// src/app/services/garage.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Garage } from '../models/garage';

@Injectable({
  providedIn: 'root'
})
export class GarageService {
  private apiUrl = 'http://localhost:9090/api/garage';

  constructor(private http: HttpClient) { }

  getAllGarages(): Observable<Garage[]> {
    return this.http.get<Garage[]>(this.apiUrl);
  }

  getGarageById(id: number): Observable<Garage> {
    return this.http.get<Garage>(`${this.apiUrl}/${id}`);
  }
}