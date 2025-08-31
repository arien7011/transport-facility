import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'available-rides', pathMatch: 'full' },
  {
    path: 'add-ride',
    loadComponent: () =>
      import('./features/rides/components/add-ride/add-ride.component').then(
        (m) => m.AddRideComponent
      ),
  },
  {
    path: 'available-rides',
    loadComponent: () =>
      import(
        './features/rides/components/available-rides/available-rides.component'
      ).then((m) => m.AvailableRidesComponent),
  },
  { path: '**', redirectTo: 'available-rides', pathMatch: 'full' },
];
