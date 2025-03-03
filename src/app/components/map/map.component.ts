// src/app/components/map/map.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GoogleMap, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { GarageService } from '../../services/garage.service';
import { AuthService } from '../../services/auth.service';
import { Garage } from '../../models/garage';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  @ViewChild(GoogleMap, { static: false }) map!: GoogleMap;
  @ViewChild(MapInfoWindow, { static: false }) info!: MapInfoWindow;

  // Map configuration
  center: google.maps.LatLngLiteral = {
    lat: 18.0735, // Default latitude for Mauritania
    lng: -15.9582 // Default longitude for Mauritania
  };
  zoom = 12;
  options: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    zoomControl: true,
    scrollwheel: true,
    disableDoubleClickZoom: true,
    maxZoom: 20,
    minZoom: 4,
  };

  // Markers
  garageMarkers: any[] = [];
  userMarker?: any;
  
  // Garage-related properties
  garages: Garage[] = [];
  selectedGarage: Garage | null = null;
  
  // Component state
  loading = true;
  error = '';
  apiLoaded = false;
  userName: string = '';

  constructor(
    private garageService: GarageService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Check if the user is a client
    const user = this.authService.currentUserValue;
    if (!user || user.role !== 'CLIENT') {
      // Redirect non-client users
      this.router.navigate(['/login']);
      return;
    }

    // Set user name
    this.userName = user.nom || 'User';

    // Load the Google Maps API script
    this.loadGoogleMapsAPI();
    
    // Load garages
    this.loadGarages();
    
    // Try to get user's current location
    this.getCurrentLocation();
  }

  loadGoogleMapsAPI(): void {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyA_LNMQF1cv68ZQZKrCZMCelJv62UaqKCo`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      this.apiLoaded = true;
    };
    document.head.appendChild(script);
  }

  loadGarages(): void {
    this.loading = true;
    this.error = '';

    this.garageService.getAllGarages().subscribe({
      next: (data) => {
        console.log('Garages received:', data);
        
        this.garages = data.filter(garage => 
          garage.latitude != null && 
          garage.longitude != null && 
          !isNaN(garage.latitude) && 
          !isNaN(garage.longitude)
        );
        
        this.loading = false;
        
        // Create markers for each valid garage
        this.createGarageMarkers();
        
        // If garages are found, center the map on the first garage
        if (this.garages.length > 0) {
          this.center = {
            lat: this.garages[0].latitude,
            lng: this.garages[0].longitude
          };
        } else {
          this.error = 'No garages found.';
        }
      },
      error: (err) => {
        console.error('Detailed garage loading error:', err);
        this.error = err.message || 'Failed to load garages. Please try again later.';
        this.loading = false;
      }
    });
  }

  createGarageMarkers(): void {
    this.garageMarkers = this.garages.map(garage => {
      return {
        position: {
          lat: garage.latitude,
          lng: garage.longitude
        },
        title: garage.nom,
        options: {
          icon: {
            url: 'assets/garage-marker.svg',
            scaledSize: new google.maps.Size(40, 40), // Adjust size as needed
            anchor: new google.maps.Point(20, 40)     // Center the icon
          },
          animation: google.maps.Animation.DROP
        },
        garage: garage
      };
    });
  }
  
  // Modify the click handler to use the new marker interaction
  selectGarage(garage: Garage | null): void {
    if (garage) {
      this.selectedGarage = garage;
      
      // Center map on selected garage
      this.center = {
        lat: garage.latitude,
        lng: garage.longitude
      };
      this.zoom = 15;
    }
  }

  closeGarageDetails(): void {
    this.selectedGarage = null;
  }

  makeReservation(): void {
    if (this.selectedGarage) {
      // TODO: Implement full reservation logic
      alert(`Reservation for ${this.selectedGarage.nom} is coming soon!`);
      // You might want to navigate to a reservation page or open a modal
      // this.router.navigate(['/reservation', this.selectedGarage.id]);
    }
  }

  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.center = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          this.zoom = 14;

          // Add user marker
          this.userMarker = {
            position: this.center,
            title: 'Your Location',
            options: {
              icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              },
              animation: google.maps.Animation.BOUNCE,
            }
          };
        },
        () => {
          console.log('Geolocation permission denied or unavailable');
        }
      );
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}