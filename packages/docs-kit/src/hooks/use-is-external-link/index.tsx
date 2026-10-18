import { useMemo } from 'react';

type UseIsExternalLinkProps = {
  href?: string;
};

export const useIsExternalLink = ({ href }: UseIsExternalLinkProps) => {
  const isExternal = useMemo(
    () => href && !href.startsWith('/') && !href.startsWith('https://docs.cms.com') && !href.startsWith('http://localhost:') && !href.startsWith('#'),
    [href],
  );

  return isExternal;
};
