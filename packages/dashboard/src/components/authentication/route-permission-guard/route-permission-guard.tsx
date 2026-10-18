'use client';

import { Container, Heading, Text } from '@cms/ui';
import { Navigate } from '../../../routing';
import { PermissionGuard, type PermissionGuardProps } from '../../common/permission-guard';
export interface RoutePermissionGuardProps extends PermissionGuardProps {
  redirectTo?: string;
}
/** Explicit requirements; no route introspection, permission registration or RBAC implementation. */
export function RoutePermissionGuard({ redirectTo, fallback, ...props }: RoutePermissionGuardProps) {
  return (
    <PermissionGuard
      {...props}
      requireAll={props.requireAll ?? true}
      fallback={fallback ?? (redirectTo ? <Navigate to={redirectTo} replace /> : <AccessDenied />)}
    />
  );
}
export function AccessDenied({
  title = 'Access denied',
  description = 'You do not have permission to view this content.',
}: {
  title?: string;
  description?: string;
}) {
  return (
    <Container role="status" className="mx-auto max-w-lg py-12 text-center">
      <Heading level="h2">{title}</Heading>
      <Text className="text-ui-fg-subtle mt-2">{description}</Text>
    </Container>
  );
}
