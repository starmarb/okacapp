import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { AppointmentOut } from '@app/api/models';

@Component({
  imports: [DatePipe],
  selector: 'app-appointment-card',
  templateUrl: './appointment-card.html',
  host: { class: 'block w-full' },
})
export class AppointmentCard {
  readonly appointment = input.required<AppointmentOut>();
}
