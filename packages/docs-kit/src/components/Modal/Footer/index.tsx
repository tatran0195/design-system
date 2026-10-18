import clsx from 'clsx';
import type React from 'react';
import { Button, type ButtonProps } from '@/components/Button';

export type ModalFooterProps = {
  actions?: ButtonProps[];
  children?: React.ReactNode;
  className?: string;
};

export const ModalFooter = ({ actions, children, className }: ModalFooterProps) => (
  <div
    className={clsx(
      'py-docs_1.5 pl-0 pr-docs_2',
      'border-cms-border-base border-0 border-t border-solid',
      'flex justify-end gap-docs_0.5',
      className,
    )}
  >
    {actions?.map((action, index) => (
      <Button {...action} key={index} />
    ))}
    {children}
  </div>
);
