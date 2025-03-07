// src/app/components/vehicle-list/vehicle-list.component.ts
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { VoitureService } from '../../services/voiture.service';
import { Vehicle } from '../../models/vehicle';

@Component({
  selector: 'app-vehicle-list',
  templateUrl: './vehicle-list.component.html',
  styleUrls: ['./vehicle-list.component.css']
})
export class VehicleListComponent implements OnInit {
  @Output() addVehicle = new EventEmitter<void>();
  @Output() editVehicle = new EventEmitter<Vehicle>();

  // Vehicle data
  userVehicles: Vehicle[] = [];
  
  // Component state
  loadingVehicles = false;
  vehicleError = '';

  constructor(private voitureService: VoitureService) {}

  ngOnInit(): void {
    this.loadUserVehicles();
  }

  loadUserVehicles(): void {
    this.loadingVehicles = true;
    this.vehicleError = '';
    
    this.voitureService.getUserVehicles().subscribe({
      next: (data) => {
        this.userVehicles = data;
        this.loadingVehicles = false;
      },
      error: (err) => {
        console.error('Error loading vehicles:', err);
        this.vehicleError = 'Failed to load your vehicles. Please try again later.';
        this.loadingVehicles = false;
      }
    });
  }

  getVehicleImageUrl(vehicle: Vehicle): string {
    if (!vehicle.image) return '';
    return `http://localhost:9090/api/voiture/images/${vehicle.image}`;
  }

  onAddVehicle(): void {
    this.addVehicle.emit();
  }

  onEditVehicle(vehicle: Vehicle): void {
    this.editVehicle.emit(vehicle);
  }

  deleteVehicle(vehicle: Vehicle): void {
    if (confirm(`Are you sure you want to delete ${vehicle.marque} ${vehicle.model}?`)) {
      this.voitureService.deleteVehicle(vehicle.id).subscribe({
        next: () => {
          // Remove vehicle from list
          this.userVehicles = this.userVehicles.filter(v => v.id !== vehicle.id);
        },
        error: (error) => {
          console.error('Error deleting vehicle:', error);
          alert('Failed to delete vehicle. Please try again.');
        }
      });
    }
  }
}