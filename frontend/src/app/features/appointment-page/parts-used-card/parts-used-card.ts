import { Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatIconModule } from '@angular/material/icon';
import { AppointmentPartOut } from '@app/api/models';
import { AppointmentsService } from '@app/api/services';
import { PartGroup } from '../part-group/part-group';
import { PartForm, PartFormRequest } from '../part-form/part-form';

@Component({
  imports: [PartGroup, MatIconModule],
  selector: 'app-parts-used-card',
  styleUrl: './parts-used-card.css',
  templateUrl: './parts-used-card.html',
})
export class PartsUsedCard {
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly bottomSheet = inject(MatBottomSheet);

  readonly appointmentId = input.required<number>();

  readonly parts = rxResource({
    params: () => this.appointmentId(),
    stream: ({ params }) => this.appointmentsService.listPartsUsed({ appointment_id: params }),
  });

  readonly totalQuantity = computed(() =>
    (this.parts.value() ?? []).reduce((total, row) => total + row.quantity, 0),
  );

  openCreate(): void {
    this.openForm({ mode: 'create', appointmentId: this.appointmentId() });
  }

  openEdit(usage: AppointmentPartOut): void {
    this.openForm({ mode: 'edit', appointmentId: this.appointmentId(), usage });
  }

  private openForm(request: PartFormRequest): void {
    this.bottomSheet
      .open<PartForm, PartFormRequest, AppointmentPartOut>(PartForm, {
        data: request,
        disableClose: true,
      })
      .afterDismissed()
      .subscribe((saved) => {
        if (saved) this.parts.reload();
      });
  }
}
