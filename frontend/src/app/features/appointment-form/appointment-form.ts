import { Component, inject, signal, computed } from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { AppointmentIn } from '@app/api/models';
import { AppointmentOut } from '@app/api/models/appointment-out';
import { SERVICE_TYPE } from '@app/api/models/service-type-array';
import { AppointmentsService } from '@app/api/services';
import { SERVICE_TYPE_LABELS } from '@app/shared/appointment-labels';
import { firstValueFrom, Observable } from 'rxjs';

const pad = (n: number) => String(n).padStart(2, '0');

// "2026-01-01T10:00:00Z" → "2026-01-01T10:00" (local time)
function toInputValue(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// "2026-01-01T10:00" → ISO string
function toIso(inputValue: string): string {
  return new Date(inputValue).toISOString();
}

export type AppointmentFormRequest =
  { mode: 'create' } | { mode: 'edit'; appointment: AppointmentOut };

export type AppointmentFormModel = Omit<AppointmentOut, 'id'>;

function emptyAppointment(): AppointmentFormModel {
  return {
    name: '',
    appointment_date: '',
    address: '',
    email: '',
    phone: '',
    service_type: 'REPAIR',
    status: 'SCHEDULED',
    work_done: '',
    completed_date: null,
  };
}

function toFormModel(appointment: AppointmentOut): AppointmentFormModel {
  const { id, ...rest } = appointment;
  return { ...rest, appointment_date: toInputValue(rest.appointment_date) };
}

@Component({
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormField,
    FormRoot,
    MatDatepickerModule,
    MatTimepickerModule,
    MatButtonModule,
  ],
  selector: 'app-appointment-form',
  styleUrl: './appointment-form.css',
  templateUrl: './appointment-form.html',
})
export class AppointmentForm {
  readonly serviceTypes = SERVICE_TYPE;
  readonly serviceTypeLabels = SERVICE_TYPE_LABELS;
  private readonly _appointmentsService = inject(AppointmentsService);

  private readonly sheetRef =
    inject<MatBottomSheetRef<AppointmentForm, AppointmentOut>>(MatBottomSheetRef);
  readonly request = inject<AppointmentFormRequest>(MAT_BOTTOM_SHEET_DATA);

  formModel = signal<AppointmentFormModel>(
    this.request.mode === 'edit' ? toFormModel(this.request.appointment) : emptyAppointment(),
  );

  formTitle = computed(() =>
    this.request.mode == 'edit' ? 'Edit Appointment' : 'Create Appointment',
  );

  private save(body: AppointmentIn): Promise<AppointmentOut> {
    if (this.request.mode === 'create') {
      return firstValueFrom(this._appointmentsService.createAppointment({ body }));
    }

    return firstValueFrom(
      this._appointmentsService.updateAppointment({
        appointment_id: this.request.appointment.id,
        body,
      }),
    );
  }

  cancel(): void {
    this.sheetRef.dismiss();
  }

  appointmentForm = form(
    this.formModel,
    (p) => {
      required(p.name);
      required(p.appointment_date);
    },
    {
      submission: {
        action: async (field) => {
          const model = field().value();
          const requestBody: AppointmentIn = {
            ...model,
            appointment_date: toIso(model.appointment_date),
          };

          try {
            const saved = await this.save(requestBody);
            this.sheetRef.dismiss(saved);
            return undefined;
          } catch {
            return { kind: 'serverError', message: 'Failed to save' };
          }
        },
      },
    },
  );
}
