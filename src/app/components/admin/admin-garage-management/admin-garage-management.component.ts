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
      categorie: [''],
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
        categorie: garage.categorie || '',
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
    
    const garageData: Garage = {
      // id is optional now since we updated the interface
      nom: this.garageForm.value.nom,
      telephone: this.garageForm.value.telephone,
      email: this.garageForm.value.email,
      categorie: this.garageForm.value.categorie,
      capacite: this.garageForm.value.capacite,
      latitude: parseFloat(this.garageForm.value.latitude),
      longitude: parseFloat(this.garageForm.value.longitude)
    };
    
    if (this.isEditing && this.selectedGarage && this.selectedGarage.id) {
      // Add ID only for updating
      garageData.id = this.selectedGarage.id;
      this.updateGarage(garageData);
    } else {
      this.addNewGarage(garageData);
    }
  }

  addNewGarage(garageData: Garage): void {
    this.loading = true;
    // Change from add to post or create a wrapper method in the service
    this.garageService.getAllGarages().subscribe(); // This is a placeholder - replace with actual method
    
    // A more direct method if you have HTTP access
    // this.http.post<number>(this.apiUrl, garageData)...
    
    // Let's simulate for now - in real code, use the actual service method
    setTimeout(() => {
      console.log('Garage added with ID: 123');
      this.loadGarages();
      this.closeGarageForm();
      this.loading = false;
    }, 500);
  }

  updateGarage(garageData: Garage): void {
    if (!this.selectedGarage?.id) return;
    
    this.loading = true;
    // Change from update to put or create a wrapper method
    this.garageService.getAllGarages().subscribe(); // This is a placeholder
    
    // Simulation - replace with actual method
    setTimeout(() => {
      console.log('Garage updated with ID:', this.selectedGarage?.id);
      this.loadGarages();
      this.closeGarageForm();
      this.loading = false;
    }, 500);
  }

  deleteGarage(garage: Garage): void {
    if (garage.id && confirm(`Are you sure you want to delete the garage "${garage.nom}"?`)) {
      this.loading = true;
      // Replace with actual delete method
      this.garageService.getAllGarages().subscribe(); // This is a placeholder
      
      // Simulation
      setTimeout(() => {
        console.log('Garage deleted');
        this.loadGarages();
        this.loading = false;
      }, 500);
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