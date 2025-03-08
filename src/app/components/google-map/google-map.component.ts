// src/app/components/google-map/google-map.component.ts
import { Component, OnInit, Input, Output, EventEmitter, NgZone } from '@angular/core';
import { GarageService } from '../../services/garage.service';
import { Garage } from '../../models/garage';

@Component({
  selector: 'app-google-map',
  templateUrl: './google-map.component.html',
  styleUrls: ['./google-map.component.css']
})
export class GoogleMapComponent implements OnInit {
  @Input() userLocation: google.maps.LatLngLiteral | null = null;
  @Output() garageSelected = new EventEmitter<Garage>();

  // Google Maps
  apiLoaded = false;
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
  userMarker: any = null;

  // Garages data
  garages: Garage[] = [];
  loading = true;
  error = '';

  constructor(
    private garageService: GarageService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    console.log('GoogleMapComponent initialized');
    this.loadGoogleMapsAPI();
    this.loadGarages();
    this.getCurrentLocation();
  }

  loadGoogleMapsAPI(): void {
    console.log('Loading Google Maps API');
    
    // Check if Google Maps API is already loaded
    if (window.google && window.google.maps) {
      console.log('Google Maps API already loaded');
      this.ngZone.run(() => {
        this.apiLoaded = true;
        this.initializeMap();
      });
      return;
    }

    // Dynamic script loading
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyA_LNMQF1cv68ZQZKrCZMCelJv62UaqKCo`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Google Maps API script loaded');
      this.ngZone.run(() => {
        this.apiLoaded = true;
        this.initializeMap();
      });
    };
    
    script.onerror = (error) => {
      console.error('Error loading Google Maps API', error);
      this.error = 'Failed to load Google Maps';
      this.loading = false;
    };

    document.head.appendChild(script);
  }

  initializeMap(): void {
    console.log('Initializing map');
    this.createGarageMarkers();
    this.createUserMarker();
  }

  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Geolocation successful', position);
          this.ngZone.run(() => {
            this.userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            
            // Update center of the map
            this.center = this.userLocation;
            
            // Create user marker
            this.createUserMarker();
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      console.log('Geolocation is not supported by this browser.');
    }
  }

  loadGarages(): void {
    console.log('Loading garages');
    this.loading = true;
    this.error = '';

    this.garageService.getAllGarages().subscribe({
      next: (data) => {
        console.log('Garages loaded:', data);
        this.garages = data.filter(garage => 
          garage.latitude != null && 
          garage.longitude != null && 
          !isNaN(garage.latitude) && 
          !isNaN(garage.longitude)
        );
        
        this.loading = false;
        
        if (this.apiLoaded) {
          this.createGarageMarkers();
        }
        
        // If garages are found and no user location, center the map on the first garage
        if (this.garages.length > 0 && !this.userLocation) {
          this.center = {
            lat: this.garages[0].latitude,
            lng: this.garages[0].longitude
          };
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
    console.log('Creating garage markers');
    if (!this.apiLoaded || !window.google) {
      console.log('Cannot create markers: API not loaded');
      return;
    }
  
    this.garageMarkers = this.garages.map(garage => ({
      position: {
        lat: garage.latitude,
        lng: garage.longitude
      },
      title: garage.nom,
      options: {
        icon: {
          url: 'assets/garage-marker.svg',
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 40)
        },
        animation: window.google.maps.Animation.DROP
      },
      onClick: () => {
        this.onMarkerClick(garage);
      }
    }));
    
    console.log('Created garage markers:', this.garageMarkers.length);
  }

  createUserMarker(): void {
    console.log('Creating user marker');
    console.log('User Location:', this.userLocation);
    console.log('API Loaded:', this.apiLoaded);
    console.log('Window Google:', !!window.google);

    if (!this.apiLoaded || !this.userLocation || !window.google) {
      console.log('Cannot create user marker - conditions not met');
      return;
    }

    // Ensure the user marker is created with correct Google Maps marker
    this.userMarker = {
      position: {
        lat: this.userLocation.lat,
        lng: this.userLocation.lng
      },
      title: 'Your Location',
      options: {
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          scaledSize: new window.google.maps.Size(40, 40)
        },
        animation: window.google.maps.Animation.BOUNCE
      }
    };

    console.log('User Marker Created:', this.userMarker);
  }

  onMarkerClick(garage: Garage): void {
    console.log('Garage marker clicked:', garage);
    this.garageSelected.emit(garage);
    
    // Center map on selected garage
    this.center = {
      lat: garage.latitude,
      lng: garage.longitude
    };
    this.zoom = 15;
  }
}