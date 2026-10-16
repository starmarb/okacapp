import { Routes } from '@angular/router';
import { Shell } from './shell';
import { Home } from './features/home/home';
import { AppointmentPage } from './features/appointment-page/appointment-page';

export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      { path: '', component: Home, title: 'OKAC' },
      { path: 'appointment/:id', component: AppointmentPage, title: 'Appointment' },
    ],
  },
];
