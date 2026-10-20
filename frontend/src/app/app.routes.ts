import { Routes } from '@angular/router';
import { Shell } from '@app/shell';
import { Home } from '@app/features/home/home';
import { AppointmentPage } from '@app/features/appointment-page/appointment-page';

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
