import { clsx } from 'clsx';

type ShadedBlockProps = {
  className?: string;
};

export const ShadedBlock = ({ className }: ShadedBlockProps) => (
  <div className={clsx('bg-repeat', 'h-full w-auto', 'bg-bg-stripes dark:bg-bg-stripes-dark dark:opacity-20', className)} />
);
