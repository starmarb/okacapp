import { Component, inject } from '@angular/core';

import { AppointmentsService } from '@app/api/services';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AppointmentCard } from '@app/shared/appointment-card/appointment-card';
import {
  AppointmentForm,
  AppointmentFormRequest,
} from '@app/features/appointment-form/appointment-form';

@Component({
  imports: [AppointmentCard, MatButtonModule, MatIconModule],
  selector: 'app-home',
  templateUrl: './home.html',
})
export class Home {
  private readonly _appointmentsService = inject(AppointmentsService);
  private readonly _bottomSheet = inject(MatBottomSheet);

  readonly appointments = rxResource({
    stream: () => this._appointmentsService.listAppointments(),
  });

  createAppointment(): void {
    this._bottomSheet
      .open(AppointmentForm, {
        data: { mode: 'create' } satisfies AppointmentFormRequest,
        disableClose: true,
      })
      .afterDismissed()
      .subscribe((created) => {
        if (created) this.appointments.reload();
      });
  }
}
