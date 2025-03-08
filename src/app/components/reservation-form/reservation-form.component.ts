import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Garage } from '../../models/garage';
import { Vehicle } from '../../models/vehicle';
import { VoitureService } from '../../services/voiture.service';
import { ReservationService, Reservation } from '../../services/reservation.service';

interface DaySlot {
  date: Date;
  dayName: string;
  dayNumber: number;
  available: boolean;
}

interface TimeSlot {
  time: string;
  available: boolean;
  displayTime: string;
}

@Component({
  selector: 'app-reservation-form',
  templateUrl: './reservation-form.component.html',
  styleUrls: ['./reservation-form.component.css']
})
export class ReservationFormComponent implements OnInit {
  @Input() garage!: Garage;
  @Output() close = new EventEmitter<void>();
  @Output() reservationCreated = new EventEmitter<any>();

  reservationForm: FormGroup;
  userVehicles: Vehicle[] = [];
  loading = false;
  error = '';
  
  // Availability data
  availableDays: { [key: string]: any } = {}; // Keyed by day of week
  daySlots: DaySlot[] = [];
  timeSlots: TimeSlot[] = [];
  selectedDay: Date | null = null;
  selectedTime: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private voitureService: VoitureService,
    private reservationService: ReservationService
  ) {
    this.reservationForm = this.formBuilder.group({
      voitureId: ['', Validators.required],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      prixEstime: [0]
    });
  }

  ngOnInit(): void {
    this.loadUserVehicles();
    this.loadGarageAvailability();
    this.generateDaySlots();
  }

  loadUserVehicles(): void {
    this.loading = true;
    this.voitureService.getUserVehicles().subscribe({
      next: (vehicles) => {
        this.userVehicles = vehicles;
        this.loading = false;
        
        // If user has no vehicles, show error
        if (vehicles.length === 0) {
          this.error = 'You need to add a vehicle before making a reservation';
        }
      },
      error: (err) => {
        console.error('Error loading vehicles:', err);
        this.error = 'Failed to load your vehicles. Please try again later.';
        this.loading = false;
      }
    });
  }

  loadGarageAvailability(): void {
    this.reservationService.getGarageAvailabilities(this.garage.id).subscribe({
      next: (availabilities) => {
        console.log('Loaded availabilities:', availabilities);
        
        // Group availabilities by day of week
        availabilities.forEach(avail => {
          const day = avail.jour;
          if (!this.availableDays[day]) {
            this.availableDays[day] = [];
          }
          this.availableDays[day].push({
            heureDebut: avail.heureDebut,
            heureFin: avail.heureFin
          });
        });
        
        console.log('Available days:', this.availableDays);
        
        // Update day slots with availability info
        this.updateDaySlotsAvailability();
      },
      error: (err) => {
        console.error('Error loading garage availability:', err);
        this.error = 'Failed to load garage availability. Please try again later.';
      }
    });
  }

  generateDaySlots(): void {
    const today = new Date();
    this.daySlots = [];
    
    // Generate slots for the next 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayOfWeek = date.getDay(); // 0 is Sunday, 1 is Monday, etc.
      const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THR', 'FRI', 'SAT'];
      
      this.daySlots.push({
        date: date,
        dayName: dayNames[dayOfWeek],
        dayNumber: date.getDate(),
        available: false // Will be updated when we load availabilities
      });
    }
  }

  updateDaySlotsAvailability(): void {
    // Map JavaScript day of week (0=Sunday) to backend enum (MONDAY, TUESDAY, etc.)
    const dayMapping = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    
    this.daySlots.forEach(slot => {
      const dayOfWeek = slot.date.getDay();
      const backendDay = dayMapping[dayOfWeek];
      slot.available = this.availableDays[backendDay] !== undefined;
    });
    
    console.log('Updated day slots:', this.daySlots);
  }

  selectDay(day: DaySlot): void {
    if (!day.available) return;
    
    this.selectedDay = day.date;
    this.generateTimeSlots(day.date);
  }

  generateTimeSlots(date: Date): void {
    const dayOfWeek = date.getDay();
    const dayMapping = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const backendDay = dayMapping[dayOfWeek];
    
    this.timeSlots = [];
    
    if (this.availableDays[backendDay]) {
      // For each availability period that day
      this.availableDays[backendDay].forEach(period => {
        // Parse time strings like "08:30:00" into hours and minutes
        const startParts = period.heureDebut.split(':');
        const endParts = period.heureFin.split(':');
        
        const startHour = parseInt(startParts[0]);
        const startMinute = parseInt(startParts[1]);
        const endHour = parseInt(endParts[0]);
        const endMinute = parseInt(endParts[1]);
        
        // Generate 30-minute time slots
        for (let h = startHour; h <= endHour; h++) {
          for (let m = 0; m < 60; m += 30) {
            // Skip slots before start time or after end time
            if ((h === startHour && m < startMinute) || 
                (h === endHour && m > endMinute)) {
              continue;
            }
            
            const timeString = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            const isPM = h >= 12;
            const displayHour = h > 12 ? h - 12 : (h === 0 ? 12 : h);
            const displayTime = `${displayHour}:${m.toString().padStart(2, '0')} ${isPM ? 'PM' : 'AM'}`;
            
            this.timeSlots.push({
              time: timeString,
              displayTime: displayTime,
              available: true
            });
          }
        }
      });
    }
    
    console.log('Generated time slots:', this.timeSlots);
  }

  selectTime(time: TimeSlot): void {
    if (!time.available) return;
    this.selectedTime = time.time;
  }

  closeModal(): void {
    this.close.emit();
  }

  onSubmit(): void {
    if (this.reservationForm.invalid || !this.selectedDay || !this.selectedTime) {
      if (!this.selectedDay) {
        this.error = 'Please select a day';
      } else if (!this.selectedTime) {
        this.error = 'Please select a time';
      }
      return;
    }

    this.loading = true;
    this.error = '';

    // Create a date object for the selected day and time
    const reservationDate = new Date(this.selectedDay);
    const [hours, minutes] = this.selectedTime.split(':').map(Number);
    reservationDate.setHours(hours, minutes, 0, 0);
    
    const formValues = this.reservationForm.value;
    
    const reservation: Reservation = {
      garageId: this.garage.id,
      voitureId: formValues.voitureId,
      dateReservation: reservationDate.toISOString(),
      description: formValues.description,
      status: 'en cours', // Default status
      prixEstime: formValues.prixEstime || 0
    };

    console.log('Submitting reservation:', reservation);

    this.reservationService.createReservation(reservation).subscribe({
      next: (response) => {
        console.log('Reservation created response:', response);
        this.loading = false;
        this.reservationCreated.emit(response);
        this.closeModal();
      },
      error: (err) => {
        console.error('Error creating reservation:', err);
        this.error = err.error || 'Failed to create reservation. Please try again.';
        this.loading = false;
      }
    });
  }

  isDayAvailable(day: DaySlot): boolean {
    return day.available;
  }

  isDaySelected(day: DaySlot): boolean {
    if (!this.selectedDay) return false;
    return day.date.getDate() === this.selectedDay.getDate() && 
           day.date.getMonth() === this.selectedDay.getMonth() && 
           day.date.getFullYear() === this.selectedDay.getFullYear();
  }

  isTimeSelected(time: TimeSlot): boolean {
    return this.selectedTime === time.time;
  }
}