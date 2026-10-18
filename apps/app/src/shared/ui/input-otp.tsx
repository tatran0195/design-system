import { OtpInput } from '@cms/ui';
import type { ComponentProps, ReactNode } from 'react';
export function InputOTP({
  maxLength = 6,
  children: _children,
  value = '',
  onChange = () => undefined,
  autoComplete: _autoComplete,
  inputMode: _inputMode,
  containerClassName,
  className,
  ...props
}: Omit<ComponentProps<typeof OtpInput>, 'length' | 'value' | 'onChange'> & {
  maxLength?: number;
  value?: string;
  onChange?: (value: string) => void;
  children?: ReactNode;
  autoComplete?: string;
  inputMode?: ComponentProps<'input'>['inputMode'];
  containerClassName?: string;
}) {
  return (
    <OtpInput
      {...props}
      className={[containerClassName, className].filter(Boolean).join(' ')}
      length={maxLength}
      value={value}
      onChange={onChange}
      separator={null}
    />
  );
}
// Layout-only upstream slot children are replaced by the primary segmented OTP.
export function InputOTPGroup({
  children,
}: {
  children?: ReactNode;
  autoComplete?: string;
  inputMode?: ComponentProps<'input'>['inputMode'];
  containerClassName?: string;
}) {
  return <>{children}</>;
}
export function InputOTPSlot(_props: { index: number; className?: string }) {
  return null;
}
