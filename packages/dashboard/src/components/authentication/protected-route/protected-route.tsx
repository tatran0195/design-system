'use client';

import type { ReactNode } from 'react';
import { Navigate } from '../../../routing';
export type AuthenticationStatus = 'loading' | 'authenticated' | 'unauthenticated';
export interface ProtectedRouteProps {
  status: AuthenticationStatus;
  children: ReactNode;
  loading?: ReactNode;
  fallback?: ReactNode;
  /** Only navigates when explicitly supplied. Authentication remains host-owned. */
  redirectTo?: string;
}
export function ProtectedRoute({ status, children, loading = null, fallback = null, redirectTo }: ProtectedRouteProps) {
  if (status === 'loading') return <>{loading}</>;
  if (status !== 'authenticated') return redirectTo ? <Navigate to={redirectTo} replace /> : <>{fallback}</>;
  return <>{children}</>;
}
export const AuthenticationBoundary = ProtectedRoute;
