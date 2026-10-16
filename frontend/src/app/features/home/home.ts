import { Component, inject, signal } from '@angular/core';

import { AppointmentsService } from '@app/api/services';
import { rxResource } from '@angular/core/rxjs-interop';
import { AppointmentCard } from './appointment-card/appointment-card';
import { RouterLink } from '@angular/router';

@Component({
  imports: [AppointmentCard, RouterLink],
  selector: 'app-home',
  templateUrl: './home.html',
})
export class Home {
  private readonly appoinmentsService = inject(AppointmentsService);
  readonly appointments = rxResource({
    stream: () => this.appoinmentsService.listAppointments(),
  });
}
