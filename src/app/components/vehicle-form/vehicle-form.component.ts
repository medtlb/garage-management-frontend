// src/app/components/vehicle-form/vehicle-form.component.ts
import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VoitureService } from '../../services/voiture.service';
import { Vehicle } from '../../models/vehicle';

@Component({
  selector: 'app-vehicle-form',
  templateUrl: './vehicle-form.component.html',
  styleUrls: ['./vehicle-form.component.css']
})
export class VehicleFormComponent implements OnInit, OnChanges {
  @Input() vehicle: Vehicle | null = null;
  @Output() close = new EventEmitter<void>();

  vehicleForm: FormGroup;
  isEditing = false;
  
  selectedFile: File | null = null;
  vehicleError = '';
  processing = false;

  constructor(
    private formBuilder: FormBuilder,
    private voitureService: VoitureService
  ) {
    this.vehicleForm = this.formBuilder.group({
      immatriculation: ['', Validators.required],
      marque: ['', Validators.required],
      model: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['vehicle'] && this.vehicle) {
      this.isEditing = true;
      this.vehicleForm.patchValue({
        immatriculation: this.vehicle.immatriculation,
        marque: this.vehicle.marque,
        model: this.vehicle.model
      });
    } else {
      this.isEditing = false;
      this.vehicleForm.reset();
    }
  }

  initializeForm(): void {
    if (this.vehicle) {
      this.isEditing = true;
      this.vehicleForm.patchValue({
        immatriculation: this.vehicle.immatriculation,
        marque: this.vehicle.marque,
        model: this.vehicle.model
      });
    }
  }

  get v() {
    return this.vehicleForm.controls;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file is an image
      if (!file.type.match('image.*')) {
        this.vehicleError = 'Please select an image file';
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.vehicleError = 'File size should not exceed 5MB';
        return;
      }
      
      this.selectedFile = file;
    }
  }

  submitVehicle(): void {
    if (this.vehicleForm.invalid) {
      return;
    }
    
    this.processing = true;
    this.vehicleError = '';
    
    const immatriculation = this.v['immatriculation'].value;
    const marque = this.v['marque'].value;
    const model = this.v['model'].value;
    
    if (this.isEditing && this.vehicle) {
      // Update existing vehicle
      this.voitureService.updateVehicle(
        this.vehicle.id,
        immatriculation, 
        marque, 
        model, 
        this.selectedFile || undefined
      ).subscribe({
        next: () => {
          this.processing = false;
          this.closeForm();
        },
        error: (error) => {
          console.error('Error updating vehicle:', error);
          this.vehicleError = error.error || 'Failed to update vehicle. Please try again.';
          this.processing = false;
        }
      });
    } else {
      // Add new vehicle
      this.voitureService.addVehicle(
        immatriculation, 
        marque, 
        model, 
        this.selectedFile || undefined
      ).subscribe({
        next: () => {
          this.processing = false;
          this.closeForm();
        },
        error: (error) => {
          console.error('Error adding vehicle:', error);
          this.vehicleError = error.error || 'Failed to add vehicle. Please try again.';
          this.processing = false;
        }
      });
    }
  }

  closeForm(): void {
    this.close.emit();
  }
}