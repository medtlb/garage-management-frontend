// src/app/components/garage-list/garage-list.component.ts
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { GarageService } from '../../services/garage.service';
import { Garage } from '../../models/garage';

@Component({
  selector: 'app-garage-list',
  templateUrl: './garage-list.component.html',
  styleUrls: ['./garage-list.component.css']
})
export class GarageListComponent implements OnInit {
  @Output() garageSelected = new EventEmitter<Garage>();

  // Garage data
  garages: Garage[] = [];
  filteredGarages: Garage[] = [];
  selectedGarageId: number | null = null;
  
  // Filtering
  selectedCategory: string = '';
  searchTerm: string = '';
  
  // Component state
  loading = true;
  error = '';

  constructor(private garageService: GarageService) {}

  ngOnInit(): void {
    this.loadGarages();
  }

  loadGarages(): void {
    this.loading = true;
    this.error = '';

    this.garageService.getAllGarages().subscribe({
      next: (data) => {
        this.garages = data;
        this.filteredGarages = [...this.garages];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading garages:', err);
        this.error = 'Failed to load garages. Please try again later.';
        this.loading = false;
      }
    });
  }

  selectGarage(garage: Garage): void {
    this.selectedGarageId = garage.id;
    this.garageSelected.emit(garage);
  }

  filterByCategory(event: any): void {
    this.selectedCategory = event.target.value;
    this.applyFilters();
  }

  filterGarages(event: any): void {
    this.searchTerm = event.target.value.toLowerCase();
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredGarages = this.garages.filter(garage => {
      const matchesCategory = !this.selectedCategory || 
        garage.categorie === this.selectedCategory;
      
      const matchesSearch = !this.searchTerm || 
        garage.nom.toLowerCase().includes(this.searchTerm);
      
      return matchesCategory && matchesSearch;
    });
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