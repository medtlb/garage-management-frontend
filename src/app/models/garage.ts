// src/app/models/garage.ts
export interface Garage {
    id: number;
    nom: string;
    latitude: number;
    longitude: number;
    telephone?: string;
    email?: string;
    capacite?: number;
  }