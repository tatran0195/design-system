'use client';

import clsx from 'clsx';
import React from 'react';
import { DottedSeparator } from '@/components/DottedSeparator';
import { useSidebar } from '@/providers/Sidebar';
import { SidebarChild } from '../Child';
import { SidebarTopMobileClose } from './MobileClose';

export const SidebarTop = React.forwardRef<HTMLDivElement>(function SidebarTop(_props, ref) {
  const { sidebarHistory } = useSidebar();

  return (
    <div className={clsx('pt-docs_0.25 sticky top-0 z-[5]', 'bg-cms-bg-base lg:bg-cms-bg-subtle')} ref={ref}>
      <SidebarTopMobileClose />
      <div>
        {sidebarHistory.length > 1 && (
          <>
            <SidebarChild />
            <DottedSeparator wrapperClassName="!my-0" />
          </>
        )}
      </div>
    </div>
  );
});
