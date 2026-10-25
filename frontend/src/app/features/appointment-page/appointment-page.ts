import { Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { AppointmentsService } from '@app/api/services';

import { AppointmentCard } from '@app/features/home/appointment-card/appointment-card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import {
  AppointmentForm,
  AppointmentFormRequest,
} from '@app/features/appointment-form/appointment-form';

@Component({
  imports: [AppointmentCard, MatIconModule, RouterLink],
  selector: 'app-appointment-page',
  styleUrl: './appointment-page.css',
  templateUrl: './appointment-page.html',
})
export class AppointmentPage {
  private _bottomSheet = inject(MatBottomSheet);
  private readonly _appointmentsService = inject(AppointmentsService);
  readonly id = input.required<number>();

  readonly appointment = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this._appointmentsService.getAppointment({ appointment_id: params }),
  });

  readonly mapsUrl = computed(() => {
    const address = this.appointment.value()!.address;
    return address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
      : null;
  });

  openForm(): void {
    let appointment = this.appointment.value();
    if (!appointment) return;

    this._bottomSheet
      .open(AppointmentForm, {
        data: { mode: 'edit', appointment } satisfies AppointmentFormRequest,
        disableClose: true,
      })
      .afterDismissed()
      .subscribe((saved) => {
        if (saved) this.appointment.reload();
      });
  }
}
