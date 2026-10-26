import { Component, inject, signal } from '@angular/core';

import { AppointmentsService } from '@app/api/services';
import { rxResource } from '@angular/core/rxjs-interop';
import { AppointmentCard } from '@app/shared/appointment-card/appointment-card';

@Component({
  imports: [AppointmentCard],
  selector: 'app-home',
  templateUrl: './home.html',
})
export class Home {
  private readonly _appointmentsService = inject(AppointmentsService);
  readonly appointments = rxResource({
    stream: () => this._appointmentsService.listAppointments(),
  });
}
