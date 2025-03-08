import { Component, OnInit } from '@angular/core';
import { ReservationService, Reservation } from '../../services/reservation.service';

@Component({
  selector: 'app-reservation-list',
  templateUrl: './reservation-list.component.html',
  styleUrls: ['./reservation-list.component.css']
})
export class ReservationListComponent implements OnInit {
  reservations: any[] = [];
  loading = false;
  error = '';

  constructor(private reservationService: ReservationService) { }

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.loading = true;
    this.error = '';

    this.reservationService.getUserReservations().subscribe({
      next: (data) => {
        this.reservations = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading reservations:', err);
        this.error = 'Failed to load your reservations. Please try again later.';
        this.loading = false;
      }
    });
  }

  cancelReservation(id: number): void {
    if (confirm('Are you sure you want to cancel this reservation?')) {
      // Find the current reservation to get its details
      const reservation = this.reservations.find(r => r.id === id);
      
      if (!reservation) {
        alert('Reservation not found.');
        return;
      }
      
      // Create a complete reservation object with required fields
      const updatedReservation: Reservation = {
        garageId: reservation.garageId,
        voitureId: reservation.voitureId,
        dateReservation: reservation.dateReservation,
        description: reservation.description,
        status: 'annulé', // Set status to cancelled
        id: id,
        prixEstime: reservation.prixEstime
      };

      this.reservationService.updateReservation(id, updatedReservation).subscribe({
        next: () => {
          // Refresh the list
          this.loadReservations();
        },
        error: (err) => {
          console.error('Error cancelling reservation:', err);
          alert('Failed to cancel reservation. Please try again.');
        }
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'en cours': return 'status-pending';
      case 'confirmé': return 'status-confirmed';
      case 'terminé': return 'status-completed';
      case 'annulé': return 'status-cancelled';
      default: return '';
    }
  }

  formatDateTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleString();
  }
}