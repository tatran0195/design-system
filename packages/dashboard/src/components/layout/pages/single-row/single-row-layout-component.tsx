import { clx } from '@cms/ui';
import type { ReactElement } from 'react';
import type { LayoutComponentProps } from '../../../layout-composer/types';

export const SingleRowLayoutComponent = ({ sections, className }: LayoutComponentProps): ReactElement => (
  <div className={clx('flex flex-row items-center gap-x-3', className)}>{sections.main}</div>
);
