import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AppointmentPartOut } from '@app/api/models';

@Component({
  imports: [MatIconModule],
  selector: 'app-part-group',
  styleUrl: './part-group.css',
  templateUrl: './part-group.html',
  host: { class: 'block px-4 py-3' },
})
export class PartGroup {
  /** One part and how many units of it were used on the appointment. */
  readonly usage = input.required<AppointmentPartOut>();
  readonly edit = output<void>();
}
