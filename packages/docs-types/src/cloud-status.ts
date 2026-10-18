/**
 * The overall status indicators reported by the CMS Cloud status page.
 */
export type CloudStatusIndicator = 'none' | 'minor' | 'major' | 'critical' | 'maintenance';

export type CloudStatus = {
  indicator: CloudStatusIndicator;
  description: string;
};
