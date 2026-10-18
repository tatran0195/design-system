'use client';

import { type UseChildDocsProps, useChildDocs } from '@/hooks/use-child-docs';

export const ChildDocs = (props: UseChildDocsProps) => {
  const { component } = useChildDocs(props);

  return <>{component}</>;
};
