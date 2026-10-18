'use client';

import type React from 'react';
import { useSiteConfig } from '../../providers/SiteConfig';
import { Pagination } from '../Pagination';

export type FooterProps = {
  editComponent?: React.ReactNode;
  showPagination?: boolean;
  feedbackComponent?: React.ReactNode;
  editDate?: string;
};

export const Footer = ({ editComponent, showPagination, feedbackComponent }: FooterProps) => {
  const { isInProduct } = useSiteConfig();

  return (
    <>
      {feedbackComponent}
      {showPagination && <Pagination />}
      {!isInProduct && editComponent}
    </>
  );
};
