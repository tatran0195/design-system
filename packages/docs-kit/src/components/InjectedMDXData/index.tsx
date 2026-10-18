'use client';

import { useEffect } from 'react';
import type { FrontMatter, ToCItem } from '@/types';
import { useSiteConfig } from '../../providers/SiteConfig';

type InjectedMDXDataProps = {
  frontmatter: FrontMatter;
  toc: ToCItem[];
};

/**
 * This component is injected by a recma plugin into MDX documents.
 */
export const InjectedMDXData = ({ frontmatter, toc }: InjectedMDXDataProps) => {
  const { setFrontmatter, setToc } = useSiteConfig();

  useEffect(() => {
    setFrontmatter(frontmatter);
  }, [frontmatter, setFrontmatter]);

  useEffect(() => {
    setToc(toc);
  }, [toc, setToc]);

  return <></>;
};
