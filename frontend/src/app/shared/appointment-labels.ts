import type { ServiceType } from '@app/api/models';

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  REPAIR: 'Repair',
  INSTALL: 'Install',
  CONSTRUCTION: 'Construction',
  OTHER: 'Other',
};
