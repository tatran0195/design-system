'use client';
import { Container, Copy, Heading, Text } from '@cms/ui';
import type { ReactNode } from 'react';
import type { AddressValue } from '../../../types/records';
import { UserLink, type UserLinkProps } from '../user-link';
export interface CustomerInfoProps {
  customer: UserLinkProps;
  company?: string | null;
  phone?: string | null;
  billingAddress?: AddressValue | null;
  shippingAddress?: AddressValue | null;
  title?: string;
  children?: ReactNode;
}
function Address({ title, address }: { title: string; address?: AddressValue | null }) {
  if (!address) return null;
  const lines = [
    [address.first_name, address.last_name].filter(Boolean).join(' '),
    address.company,
    address.address_1,
    address.address_2,
    [address.postal_code, address.city].filter(Boolean).join(' '),
    [address.province, address.country_code?.toUpperCase()].filter(Boolean).join(', '),
  ].filter(Boolean);
  return (
    <section>
      <Text size="small" weight="plus">
        {title}
      </Text>
      <address className="text-ui-fg-subtle mt-1 text-sm not-italic">
        {lines.map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </address>
    </section>
  );
}
export function CustomerInfo({ customer, company, phone, billingAddress, shippingAddress, title = 'Customer', children }: CustomerInfoProps) {
  return (
    <Container className="flex flex-col gap-4">
      <Heading level="h2">{title}</Heading>
      <UserLink {...customer} />
      {company && <Text size="small">{company}</Text>}
      {customer.email && (
        <div className="flex min-w-0 items-center gap-2">
          <Text size="small" className="break-all">
            {customer.email}
          </Text>
          <Copy content={customer.email} />
        </div>
      )}
      {phone && (
        <div className="flex items-center gap-2">
          <Text size="small">{phone}</Text>
          <Copy content={phone} />
        </div>
      )}
      <Address title="Shipping address" address={shippingAddress} />
      <Address title="Billing address" address={billingAddress} />
      {children}
    </Container>
  );
}
