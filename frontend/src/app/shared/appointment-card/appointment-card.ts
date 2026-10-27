import { DatePipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AppointmentOut } from '@app/api/models';

import { ServiceTypeBadge } from '@app/shared/service-type-badge/service-type-badge';
import { CardOptions } from './card-options/card-options';

@Component({
  imports: [DatePipe, RouterLink, ServiceTypeBadge, MatIconModule],
  selector: 'app-appointment-card',
  templateUrl: './appointment-card.html',
  host: { class: 'block w-full' },
})
export class AppointmentCard {
  private _bottomSheet = inject(MatBottomSheet);
  readonly appointment = input.required<AppointmentOut>();

  get mapsHref(): string {
    const address = this.appointment().address ?? '';
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }

  openOptions(): void {
    this._bottomSheet.open(CardOptions, { data: this.appointment() });
  }
}
