import { Component, input } from '@angular/core';
import { PartInstanceWithPartOut, PartOut } from '@app/api/models';

/** One part plus the instances of it used on an appointment. */
export interface PartUsageGroup {
  part: PartOut;
  instances: PartInstanceWithPartOut[];
}

@Component({
  selector: 'app-part-group',
  styleUrl: './part-group.css',
  templateUrl: './part-group.html',
  host: { class: 'block px-4 py-3' },
})
export class PartGroup {
  readonly group = input.required<PartUsageGroup>();
}
