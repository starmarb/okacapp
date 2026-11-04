import { Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { AppointmentsService } from '@app/api/services';
import { PartGroup } from '../part-group/part-group';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { PartForm } from '../part-form/part-form';
import { MatIconModule } from '@angular/material/icon';

@Component({
  imports: [PartGroup, MatIconModule],
  selector: 'app-parts-used-card',
  styleUrl: './parts-used-card.css',
  templateUrl: './parts-used-card.html',
})
export class PartsUsedCard {
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly _bottomshset = inject(MatBottomSheet);

  readonly appointmentId = input.required<number>();

  readonly parts = rxResource({
    params: () => this.appointmentId(),
    stream: ({ params }) => this.appointmentsService.listPartsUsed({ appointment_id: params }),
  });

  readonly totalQuantity = computed(() =>
    (this.parts.value() ?? []).reduce((total, row) => total + row.quantity, 0),
  );

  openForm(): void {
    this._bottomshset.open(PartForm);
  }
}
