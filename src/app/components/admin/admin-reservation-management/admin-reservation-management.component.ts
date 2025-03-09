import { Component, OnInit } from '@angular/core';
import { ReservationService } from '../../../services/reservation.service';

@Component({
  selector: 'app-admin-reservation-management',
  templateUrl: './admin-reservation-management.component.html',
  styleUrls: ['./admin-reservation-management.component.css']
})
export class AdminReservationManagementComponent implements OnInit {
  reservations: any[] = [];
  loading = false;
  error = '';

  constructor(private reservationService: ReservationService) {}

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.loading = true;
    this.error = '';

    this.reservationService.getAll().subscribe({
      next: (data) => {
        this.reservations = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading reservations:', err);
        this.error = 'Failed to load reservations. Please try again later.';
        this.loading = false;
      }
    });
  }

  updateReservationStatus(id: number, status: string): void {
    this.reservationService.updateReservationStatus(id, status).subscribe({
      next: () => {
        // Update the local reservation status
        const index = this.reservations.findIndex(r => r.id === id);
        if (index !== -1) {
          this.reservations[index].status = status;
        }
        alert(`Reservation status updated to ${status}`);
      },
      error: (err) => {
        console.error('Error updating reservation status:', err);
        alert('Failed to update reservation status. Please try again.');
      }
    });
  }

  // Helper method to get CSS class for status badges
  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'en cours': return 'status-pending';
      case 'confirmé': return 'status-confirmed';
      case 'terminé': return 'status-completed';
      case 'annulé': return 'status-cancelled';
      default: return '';
    }
  }

  // Format date for display
  formatDateTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleString();
  }
}