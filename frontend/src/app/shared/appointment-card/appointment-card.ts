import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppointmentOut } from '@app/api/models';

import { ServiceTypeBadge } from '@app/shared/service-type-badge/service-type-badge';

@Component({
  imports: [DatePipe, RouterLink, ServiceTypeBadge],
  selector: 'app-appointment-card',
  templateUrl: './appointment-card.html',
  host: { class: 'block w-full' },
})
export class AppointmentCard {
  readonly appointment = input.required<AppointmentOut>();

  get mapsHref(): string {
    const address = this.appointment().address ?? '';
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }
}
