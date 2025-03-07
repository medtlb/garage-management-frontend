// src/app/components/google-map/google-map.component.ts
import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import { GarageService } from '../../services/garage.service';
import { Garage } from '../../models/garage';

@Component({
  selector: 'app-google-map',
  templateUrl: './google-map.component.html',
  styleUrls: ['./google-map.component.css']
})
export class GoogleMapComponent implements OnInit, OnChanges, AfterViewInit {
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
  userMarker?: any;

  // Garages data
  garages: Garage[] = [];
  loading = true;
  error = '';

  constructor(private garageService: GarageService) {}

  ngOnInit(): void {
    console.log('GoogleMapComponent initialized');
    // Load the Google Maps API script
    this.loadGoogleMapsAPI();
    
    // Load garages
    this.loadGarages();
  }

  ngAfterViewInit(): void {
    console.log('GoogleMapComponent view initialized');
    if (!this.apiLoaded) {
      this.loadGoogleMapsAPI();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('GoogleMapComponent changes detected', changes);
    // Update user marker when userLocation changes
    if (changes['userLocation'] && this.userLocation) {
      this.center = this.userLocation;
      this.createUserMarker();
    }
  }

  loadGoogleMapsAPI(): void {
    console.log('Loading Google Maps API');
    if (window.google && window.google.maps) {
      console.log('Google Maps API already loaded');
      this.apiLoaded = true;
      this.createGarageMarkers();
      this.createUserMarker();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyA_LNMQF1cv68ZQZKrCZMCelJv62UaqKCo`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('Google Maps API loaded successfully');
      this.apiLoaded = true;
      this.createGarageMarkers();
      if (this.userLocation) {
        this.createUserMarker();
      }
    };
    document.head.appendChild(script);
  }

  loadGarages(): void {
    console.log('Loading garages data');
    this.loading = true;
    this.error = '';

    this.garageService.getAllGarages().subscribe({
      next: (data) => {
        console.log('Garages loaded successfully', data);
        this.garages = data.filter(garage => 
          garage.latitude != null && 
          garage.longitude != null && 
          !isNaN(garage.latitude) && 
          !isNaN(garage.longitude)
        );
        
        this.loading = false;
        
        // Create markers for each valid garage
        this.createGarageMarkers();
        
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
    console.log('Creating garage markers, API loaded:', this.apiLoaded);
    if (!this.apiLoaded || !window.google) {
      console.log('Google Maps API not loaded yet, skipping marker creation');
      return;
    }
  
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
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 40)
          },
          animation: google.maps.Animation.DROP
        },
        onClick: () => {
          this.onMarkerClick(garage);
        }
      };
    });
    
    console.log('Created garage markers:', this.garageMarkers.length);
  }

  createUserMarker(): void {
    console.log('Creating user marker, API loaded:', this.apiLoaded, 'User location:', this.userLocation);
    if (!this.apiLoaded || !this.userLocation || !window.google) {
      console.log('Cannot create user marker: API not loaded or no user location');
      return;
    }

    this.userMarker = {
      position: this.userLocation,
      title: 'Your Location',
      options: {
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        },
        animation: google.maps.Animation.BOUNCE,
      }
    };
    
    console.log('User marker created');
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