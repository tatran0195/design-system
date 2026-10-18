import type { IconProps } from '@cms/icons/dist/types';
import clsx from 'clsx';
import type React from 'react';

type InlineIconProps = IconProps & {
  Icon: React.ComponentType<IconProps>;
  alt?: string;
};

export const InlineIcon = ({ Icon, alt, ...props }: InlineIconProps) => (
  <Icon {...props} className={clsx('text-cms-fg-subtle inline-block align-middle', props.className)} aria-label={alt} />
);
