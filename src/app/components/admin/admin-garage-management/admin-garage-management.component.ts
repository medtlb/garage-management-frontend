import { Component, OnInit } from '@angular/core';
import { GarageService } from '../../../services/garage.service';
import { Garage } from '../../../models/garage';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VehiculeCategorie } from '../../../models/vehicule-categorie.enum';

@Component({
  selector: 'app-admin-garage-management',
  templateUrl: './admin-garage-management.component.html',
  styleUrls: ['./admin-garage-management.component.css']
})
export class AdminGarageManagementComponent implements OnInit {
  garages: Garage[] = [];
  loading = false;
  isSubmitting = false;
  error = '';
  
  // Form for adding/editing garage
  garageForm: FormGroup;
  showGarageForm = false;
  isEditing = false;
  selectedGarage: Garage | null = null;
  
  // For the map
  center: google.maps.LatLngLiteral = {
    lat: 18.0735, // Default latitude for Mauritania
    lng: -15.9582 // Default longitude for Mauritania
  };
  zoom = 12;
  markerPosition: google.maps.LatLngLiteral | null = null;
  
  // Category options for dropdown
  categories = Object.values(VehiculeCategorie);

  constructor(
    private garageService: GarageService,
    private formBuilder: FormBuilder
  ) {
    this.garageForm = this.formBuilder.group({
      nom: ['', Validators.required],
      telephone: [''],
      email: ['', [Validators.email]],
      categorie: [''], // Ensure this matches the enum values exactly
      capacite: [null],
      latitude: ['', [Validators.required, Validators.pattern(/^-?\d+(\.\d+)?$/)]],
      longitude: ['', [Validators.required, Validators.pattern(/^-?\d+(\.\d+)?$/)]]
    });
  }

  ngOnInit(): void {
    this.loadGarages();
  }

  loadGarages(): void {
    this.loading = true;
    this.error = '';

    this.garageService.getAllGarages().subscribe({
      next: (data) => {
        this.garages = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading garages:', err);
        this.error = 'Failed to load garages. Please try again later.';
        this.loading = false;
      }
    });
  }

  openGarageForm(garage?: Garage): void {
    this.selectedGarage = garage || null;
    this.isEditing = !!garage;
    
    if (garage) {
      this.garageForm.patchValue({
        nom: garage.nom,
        telephone: garage.telephone || '',
        email: garage.email || '',
        categorie: garage.categorie || '', // Ensure this matches exactly
        capacite: garage.capacite || null,
        latitude: garage.latitude,
        longitude: garage.longitude
      });
      
      this.markerPosition = {
        lat: garage.latitude,
        lng: garage.longitude
      };
      
      this.center = {
        lat: garage.latitude,
        lng: garage.longitude
      };
    } else {
      this.garageForm.reset();
      this.markerPosition = null;
    }
    
    this.showGarageForm = true;
  }

  closeGarageForm(): void {
    this.showGarageForm = false;
    this.selectedGarage = null;
    this.garageForm.reset();
    this.isSubmitting = false;
  }

  onMapClick(event: google.maps.MapMouseEvent): void {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      this.markerPosition = { lat, lng };
      this.garageForm.patchValue({
        latitude: lat,
        longitude: lng
      });
    }
  }

  submitGarageForm(): void {
    if (this.garageForm.invalid) {
      return;
    }
    
    this.isSubmitting = true;
    
    const garageData: Garage = {
      nom: this.garageForm.value.nom,
      telephone: this.garageForm.value.telephone,
      email: this.garageForm.value.email,
      categorie: this.garageForm.value.categorie || null, // Explicitly handle null
      capacite: this.garageForm.value.capacite,
      latitude: parseFloat(this.garageForm.value.latitude),
      longitude: parseFloat(this.garageForm.value.longitude)
    };
    
    console.log('Submitting garage data:', garageData);
    
    if (this.isEditing && this.selectedGarage && this.selectedGarage.id) {
      garageData.id = this.selectedGarage.id;
      this.updateGarage(garageData);
    } else {
      this.addNewGarage(garageData);
    }
  }

  addNewGarage(garageData: Garage): void {
    this.loading = true;
    this.garageService.add(garageData).subscribe({
      next: (id) => {
        console.log(`Added garage with ID: ${id}`);
        this.loadGarages();
        this.closeGarageForm();
        this.loading = false;
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error adding garage:', error);
        alert('Failed to add garage. Please try again.');
        this.loading = false;
        this.isSubmitting = false;
      }
    });
  }

  updateGarage(garageData: Garage): void {
    if (!this.selectedGarage?.id) return;
    
    this.loading = true;
    this.garageService.update(garageData, this.selectedGarage.id).subscribe({
      next: (id) => {
        console.log(`Updated garage with ID: ${id}`);
        this.loadGarages();
        this.closeGarageForm();
        this.loading = false;
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error updating garage:', error);
        alert('Failed to update garage. Please try again.');
        this.loading = false;
        this.isSubmitting = false;
      }
    });
  }

  deleteGarage(garage: Garage): void {
    if (garage.id && confirm(`Are you sure you want to delete the garage "${garage.nom}"?`)) {
      this.loading = true;
      this.garageService.deleteById(garage.id).subscribe({
        next: () => {
          console.log('Garage deleted');
          this.loadGarages();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error deleting garage:', error);
          alert('Failed to delete garage. Please try again.');
          this.loading = false;
        }
      });
    }
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