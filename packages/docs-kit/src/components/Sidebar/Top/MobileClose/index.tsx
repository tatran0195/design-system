'use client';

import { XMarkMini } from '@cms/icons';
import { Button } from '@/components/Button';
import { useSidebar } from '@/providers/Sidebar';

export const SidebarTopMobileClose = () => {
  const { setMobileSidebarOpen } = useSidebar();

  return (
    <div className="m-docs_0.75 lg:hidden">
      <Button variant="transparent-clear" onClick={() => setMobileSidebarOpen(false)} className="!p-0 hover:!bg-transparent">
        <XMarkMini className="text-cms-fg-subtle" />
      </Button>
    </div>
  );
};
