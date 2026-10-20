import { Component, inject, signal } from '@angular/core';
import { form, FormField, FormRoot } from '@angular/forms/signals';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { ServiceType } from '@app/api/models';
import { AppointmentOut } from '@app/api/models/appointment-out';
import { SERVICE_TYPE_LABELS } from '@app/shared/appointment-labels';

@Component({
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormField,
    FormRoot,
    MatDatepickerModule,
    MatTimepickerModule,
  ],
  selector: 'app-appointment-form',
  styleUrl: './appointment-form.css',
  templateUrl: './appointment-form.html',
})
export class AppointmentForm {
  readonly data = inject<AppointmentOut>(MAT_BOTTOM_SHEET_DATA);
  formModel = signal<AppointmentOut>(this.data);

  readonly serviceTypeOptions = Object.entries(SERVICE_TYPE_LABELS).map(([value, label]) => ({
    value: value as ServiceType,
    label,
  }));

  appointmentForm = form(this.formModel);
}
