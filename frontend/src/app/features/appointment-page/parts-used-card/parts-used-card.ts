import { Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { AppointmentsService } from '@app/api/services';
import { PartGroup, PartUsageGroup } from '../part-group/part-group';
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
  private readonly _bottomSheet = inject(MatBottomSheet);

  readonly appointmentId = input.required<number>();

  readonly instances = rxResource({
    params: () => this.appointmentId(),
    stream: ({ params }) =>
      this.appointmentsService.listAppointmentParts({ appointment_id: params }),
  });

  /** Instances bucketed by part; the Map keeps first-seen order. */
  readonly groups = computed<PartUsageGroup[]>(() => {
    const byPart = new Map<number, PartUsageGroup>();

    for (const instance of this.instances.value() ?? []) {
      const existing = byPart.get(instance.part.id);
      if (existing) {
        existing.instances.push(instance);
      } else {
        byPart.set(instance.part.id, { part: instance.part, instances: [instance] });
      }
    }

    return [...byPart.values()];
  });

  readonly instanceCount = computed(() => this.instances.value()?.length ?? 0);

  openForm(): void {
    this._bottomSheet.open(PartForm);
  }
}
