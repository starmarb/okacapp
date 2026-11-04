import { Component, computed, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AppointmentPartOut, PartUsedIn } from '@app/api/models';
import { AppointmentsService } from '@app/api/services';

export type PartFormRequest =
  | { mode: 'create'; appointmentId: number }
  | { mode: 'edit'; appointmentId: number; usage: AppointmentPartOut };

interface PartFormModel {
  brand: string;
  name: string;
  model_number: string;
  /** One entry per unit used; blank means "unknown serial". */
  serials: string[];
}

function emptyModel(): PartFormModel {
  return { brand: '', name: '', model_number: '', serials: [''] };
}

function toModel(usage: AppointmentPartOut): PartFormModel {
  const lines = Math.max(usage.quantity, usage.serial_numbers.length, 1);
  return {
    brand: usage.part.brand,
    name: usage.part.name,
    model_number: usage.part.model_number,
    serials: Array.from({ length: lines }, (_, i) => usage.serial_numbers[i] ?? ''),
  };
}

@Component({
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    FormField,
    FormRoot,
  ],
  selector: 'app-part-form',
  styleUrl: './part-form.css',
  templateUrl: './part-form.html',
})
export class PartForm {
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly sheetRef =
    inject<MatBottomSheetRef<PartForm, AppointmentPartOut>>(MatBottomSheetRef);
  readonly request = inject<PartFormRequest>(MAT_BOTTOM_SHEET_DATA);

  readonly formModel = signal<PartFormModel>(
    this.request.mode === 'edit' ? toModel(this.request.usage) : emptyModel(),
  );

  readonly title = this.request.mode === 'edit' ? 'Edit Part' : 'Add Part';

  // Mirrors the server rule: brand is required, plus a name or a model number.
  readonly hasIdentifier = computed(() => {
    const model = this.formModel();
    return !!model.name.trim() || !!model.model_number.trim();
  });

  addSerial(): void {
    this.formModel.update((model) => ({ ...model, serials: [...model.serials, ''] }));
  }

  removeSerial(): void {
    this.formModel.update((model) =>
      model.serials.length <= 1 ? model : { ...model, serials: model.serials.slice(0, -1) },
    );
  }

  cancel(): void {
    this.sheetRef.dismiss();
  }

  readonly partForm = form(
    this.formModel,
    (p) => {
      required(p.brand);
    },
    {
      submission: {
        action: async (field) => {
          const model = field().value();
          const body: PartUsedIn = {
            brand: model.brand.trim(),
            name: model.name.trim(),
            model_number: model.model_number.trim(),
            quantity: model.serials.length,
            serial_numbers: model.serials.map((serial) => serial.trim()).filter(Boolean),
          };

          const request = this.request;

          try {
            const saved =
              request.mode === 'create'
                ? await firstValueFrom(
                    this.appointmentsService.addPartUsed({
                      appointment_id: request.appointmentId,
                      body,
                    }),
                  )
                : await firstValueFrom(
                    this.appointmentsService.updatePartUsed({
                      appointment_id: request.appointmentId,
                      appointment_part_id: request.usage.id,
                      body,
                    }),
                  );

            this.sheetRef.dismiss(saved);
            return undefined;
          } catch {
            return { kind: 'serverError', message: 'Failed to save part' };
          }
        },
      },
    },
  );
}
