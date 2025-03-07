// src/app/components/garage-detail/garage-detail.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Garage } from '../../models/garage';

@Component({
  selector: 'app-garage-detail',
  templateUrl: './garage-detail.component.html',
  styleUrls: ['./garage-detail.component.css']
})
export class GarageDetailComponent {
  @Input() garage!: Garage;
  @Output() close = new EventEmitter<void>();

  closeModal(): void {
    this.close.emit();
  }

  makeReservation(): void {
    // TODO: Implement reservation logic
    alert(`Reservation for ${this.garage.nom} is coming soon!`);
  }

  getCategoryLabel(category: string | undefined): string {
    const categoryLabels: Record<string, string> = {
      'VEHICULES_LEGERS': 'Véhicules légers',
      'VEHICULES_UTILITAIRES': 'Véhicules utilitaires',
      'CAMIONS': 'Camions',
      'VEHICULES_ELECTRIQUES_HYBRIDES': 'Véhicules électriques et hybrides',
      'MOTOS_SCOOTERS': 'Motos et scooters',
      'ENGINS_AGRICOLES': 'Engins agricoles',
      'VEHICULES_CHANTIER': 'Véhicules de chantier'
    };
  
    return category && categoryLabels[category] 
      ? categoryLabels[category] 
      : (category || 'Non spécifié');
  }
}