import { Spinner } from '@cms/icons';
import type { IconProps } from '@cms/icons/dist/types';
import clsx from 'clsx';

export type SpinnerLoadingProps = {
  iconProps?: IconProps;
};

export const SpinnerLoading = ({ iconProps }: SpinnerLoadingProps) => (
  <span role="status">
    <Spinner {...iconProps} className={clsx('animate-spin', iconProps?.className)} />
  </span>
);
