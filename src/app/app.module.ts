import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';

// Components
import { MapContainerComponent } from './components/map-container/map-container.component';
import { HeaderComponent } from './components/header/header.component';
import { GoogleMapComponent } from './components/google-map/google-map.component';
import { GarageListComponent } from './components/garage-list/garage-list.component';
import { GarageDetailComponent } from './components/garage-detail/garage-detail.component';
import { VehicleListComponent } from './components/vehicle-list/vehicle-list.component';
import { VehicleFormComponent } from './components/vehicle-form/vehicle-form.component';
import { ReservationFormComponent } from './components/reservation-form/reservation-form.component';
import { ReservationListComponent } from './components/reservation-list/reservation-list.component';

// Admin Components
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { AdminGarageManagementComponent } from './components/admin/admin-garage-management/admin-garage-management.component';
import { AdminReservationManagementComponent } from './components/admin/admin-reservation-management/admin-reservation-management.component';

@NgModule({
 declarations: [
   AppComponent,
   LoginComponent,
   RegisterComponent,
   MapContainerComponent,
   HeaderComponent,
   GoogleMapComponent,
   GarageListComponent,
   GarageDetailComponent,
   VehicleListComponent,
   VehicleFormComponent,
   ReservationFormComponent,
   ReservationListComponent,
   AdminDashboardComponent,
   AdminGarageManagementComponent,
   AdminReservationManagementComponent
 ],
 imports: [
   BrowserModule,
   AppRoutingModule,
   HttpClientModule,
   ReactiveFormsModule,
   GoogleMapsModule,
 ],
 providers: [
   { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
 ],
 bootstrap: [AppComponent]
})
export class AppModule { }