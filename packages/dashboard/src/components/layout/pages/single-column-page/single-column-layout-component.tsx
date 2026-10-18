import { clx } from '@cms/ui';
import type { ReactElement } from 'react';
import type { LayoutComponentProps } from '../../../layout-composer/types';

export const SingleColumnLayoutComponent = ({ sections, className }: LayoutComponentProps): ReactElement => (
  <div className={clx('flex flex-col gap-y-3', className)}>{sections.main}</div>
);
