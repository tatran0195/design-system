import clsx from 'clsx';

export type DotsLoadingProps = {
  className?: string;
};

export const DotsLoading = ({ className }: DotsLoadingProps) => (
  <span className={clsx('text-medium text-cms-fg-subtle', className)}>
    <span className="animate-pulsingDots">.</span>
    <span className="animate-pulsingDots animation-delay-[500ms]">.</span>
    <span className="animate-pulsingDots animation-delay-[1000ms]">.</span>
  </span>
);
