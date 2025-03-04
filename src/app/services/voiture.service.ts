// src/app/services/voiture.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vehicle } from '../models/vehicle';

@Injectable({
  providedIn: 'root'
})
export class VoitureService {
  private apiUrl = 'http://localhost:9090/api/voiture';

  constructor(private http: HttpClient) { }

  getUserVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.apiUrl}/user`);
  }

  getVehicleById(id: number): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.apiUrl}/${id}`);
  }

  addVehicle(immatriculation: string, marque: string, model: string, file?: File): Observable<any> {
    const formData = new FormData();
    formData.append('immatriculation', immatriculation);
    formData.append('marque', marque);
    formData.append('model', model);
    
    if (file) {
      formData.append('file', file);
    }
    
    return this.http.post(`${this.apiUrl}/with-image`, formData);
  }

  updateVehicle(id: number, immatriculation: string, marque: string, model: string, file?: File): Observable<any> {
    const formData = new FormData();
    formData.append('immatriculation', immatriculation);
    formData.append('marque', marque);
    formData.append('model', model);
    
    if (file) {
      formData.append('file', file);
    }
    
    return this.http.put(`${this.apiUrl}/${id}/with-image`, formData);
  }

  deleteVehicle(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}