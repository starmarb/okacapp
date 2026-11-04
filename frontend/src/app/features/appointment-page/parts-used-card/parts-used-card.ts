import { Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { AppointmentsService } from '@app/api/services';
import { PartGroup } from '../part-group/part-group';

@Component({
  imports: [PartGroup],
  selector: 'app-parts-used-card',
  styleUrl: './parts-used-card.css',
  templateUrl: './parts-used-card.html',
})
export class PartsUsedCard {
  private readonly appointmentsService = inject(AppointmentsService);

  readonly appointmentId = input.required<number>();

  readonly parts = rxResource({
    params: () => this.appointmentId(),
    stream: ({ params }) => this.appointmentsService.listPartsUsed({ appointment_id: params }),
  });

  readonly totalQuantity = computed(() =>
    (this.parts.value() ?? []).reduce((total, row) => total + row.quantity, 0),
  );
}
