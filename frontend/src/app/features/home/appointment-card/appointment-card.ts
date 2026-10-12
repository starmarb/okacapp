import { Component, input } from '@angular/core';
import { AppointmentOut } from '@app/api/models';

@Component({
  imports: [],
  selector: 'app-appointment-card',
  templateUrl: './appointment-card.html',
})
export class AppointmentCard {
  readonly appointment = input.required<AppointmentOut>();
}
