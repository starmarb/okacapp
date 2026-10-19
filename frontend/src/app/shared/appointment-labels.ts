import type { ServiceType } from '@app/api/models';

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  REPAIR: 'Repair',
  INSTALL: 'Install',
  CONSTRUCTION: 'Construction',
  OTHER: 'Other',
};

export const SERVICE_TYPE_ICONS: Record<ServiceType, string> = {
  REPAIR: 'build',
  INSTALL: 'construction',
  CONSTRUCTION: 'foundation',
  OTHER: 'more_horiz',
};
