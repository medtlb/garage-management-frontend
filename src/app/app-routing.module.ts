import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { MapContainerComponent } from './components/map-container/map-container.component';
import { ReservationListComponent } from './components/reservation-list/reservation-list.component';
import { ClientGuard } from './guards/client.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'map', component: MapContainerComponent, canActivate: [ClientGuard] },
  { path: 'reservations', component: ReservationListComponent, canActivate: [ClientGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }