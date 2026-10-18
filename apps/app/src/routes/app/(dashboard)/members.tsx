import { createFileRoute } from '@tanstack/react-router';
import { MembersPage } from '@/features/membership/pages';
export const Route = createFileRoute('/app/(dashboard)/members')({
  component: MembersPage,
});
