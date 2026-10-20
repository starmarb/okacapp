import { Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { AppointmentsService } from '@app/api/services';

import { AppointmentCard } from '@app/features/home/appointment-card/appointment-card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  imports: [AppointmentCard, MatIconModule, RouterLink],
  selector: 'app-appointment-page',
  styleUrl: './appointment-page.css',
  templateUrl: './appointment-page.html',
})
export class AppointmentPage {
  private readonly appointmentsService = inject(AppointmentsService);
  readonly id = input.required<number>();

  readonly appointment = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this.appointmentsService.getAppointment({ appointment_id: params }),
  });

  readonly mapsUrl = computed(() => {
    const address = this.appointment.value()!.address;
    return address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
      : null;
  });
}
