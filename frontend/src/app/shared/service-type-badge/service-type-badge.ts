import { Component, computed, input } from '@angular/core';
import type { ServiceType } from '@app/api/models';
import { SERVICE_TYPE_LABELS } from '../appointment-labels';

@Component({
  imports: [],
  selector: 'app-service-type-badge',
  styleUrl: './service-type-badge.css',
  templateUrl: './service-type-badge.html',
})
export class ServiceTypeBadge {
  readonly service_type = input.required<ServiceType>();
  readonly label = computed(() => SERVICE_TYPE_LABELS[this.service_type()]);
}
