import { DatePipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { AppointmentsService } from '@app/api/services';

import { ServiceTypeBadge } from '@app/shared/service-type-badge/service-type-badge';
import { AppointmentCard } from '../home/appointment-card/appointment-card';

@Component({
  imports: [DatePipe, ServiceTypeBadge, AppointmentCard],
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
