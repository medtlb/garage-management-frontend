// src/app/components/map-container/map-container.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Garage } from '../../models/garage';
import { Vehicle } from '../../models/vehicle';

@Component({
  selector: 'app-map-container',
  templateUrl: './map-container.component.html',
  styleUrls: ['./map-container.component.css']
})
export class MapContainerComponent implements OnInit {
  // User info
  userName: string = '';
  
  // Component state
  activeTab: 'garages' | 'vehicles' = 'garages';
  
  // Selected garage for detail view
  selectedGarage: Garage | null = null;
  
  // User location
  userLocation: google.maps.LatLngLiteral | null = null;
  
  // Vehicle management
  showVehicleForm = false;
  selectedVehicle: Vehicle | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is a client
    const user = this.authService.currentUserValue;
    if (!user || user.role !== 'CLIENT') {
      this.router.navigate(['/login']);
      return;
    }

    // Set user name
    this.userName = user.nom || 'User';
    
    // Try to get user's current location
    this.getCurrentLocation();
  }

  // Method to handle tab switching
  setActiveTab(tab: 'garages' | 'vehicles'): void {
    this.activeTab = tab;
  }

  // Method to select a garage for detail view
  onGarageSelected(garage: Garage): void {
    this.selectedGarage = garage;
  }

  // Method to close garage details
  closeGarageDetails(): void {
    this.selectedGarage = null;
  }

  // Method to handle vehicle form visibility
  toggleVehicleForm(vehicle: Vehicle | null = null): void {
    this.selectedVehicle = vehicle;
    this.showVehicleForm = !this.showVehicleForm;
  }

  // Method to get user's current location
  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
        },
        () => {
          console.log('Geolocation permission denied or unavailable');
        }
      );
    }
  }

  // Logout handler
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}