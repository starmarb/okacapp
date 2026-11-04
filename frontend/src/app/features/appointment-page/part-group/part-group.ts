import { Component, input } from '@angular/core';
import { AppointmentPartOut } from '@app/api/models';

@Component({
  selector: 'app-part-group',
  styleUrl: './part-group.css',
  templateUrl: './part-group.html',
  host: { class: 'block px-4 py-3' },
})
export class PartGroup {
  /** One part and how many units of it were used on the appointment. */
  readonly usage = input.required<AppointmentPartOut>();
}
