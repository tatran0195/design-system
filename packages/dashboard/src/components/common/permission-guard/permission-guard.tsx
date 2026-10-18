'use client';

import type { ReactNode } from 'react';
import { useDashboardAuthorization } from '../../../config';
/** Independent presentation-only callback guard. It does not evaluate policies. */
export interface PermissionGuardProps {
  children?: ReactNode;
  permission?: string;
  permissions?: readonly string[];
  resource?: string;
  operation?: string;
  requireAll?: boolean;
  fallback?: ReactNode;
  loading?: boolean;
  loadingComponent?: ReactNode;
  authorize?: (permissions: readonly string[], mode: 'all' | 'any') => boolean;
}
export function PermissionGuard({
  children,
  permission,
  permissions,
  resource,
  operation,
  requireAll = false,
  fallback = null,
  loading = false,
  loadingComponent = null,
  authorize,
}: PermissionGuardProps) {
  const configured = useDashboardAuthorization();
  if (loading) return <>{loadingComponent}</>;
  const requirements = permissions ?? (permission ? [permission] : resource && operation ? [`${resource}:${operation}`] : []);
  return <>{(authorize ?? configured)(requirements, requireAll ? 'all' : 'any') ? children : fallback}</>;
}
