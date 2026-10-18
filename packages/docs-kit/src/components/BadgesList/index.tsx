import clsx from 'clsx';
import { Badge, type BadgeProps } from '../Badge';

type BadgesListProps = {
  badges: BadgeProps[];
  className?: string;
};

export const BadgesList = ({ badges, className }: BadgesListProps) => (
  <div className={clsx('flex flex-wrap gap-docs_0.5', className)}>
    {badges.map((badgeProps, index) => (
      <Badge {...badgeProps} key={index} />
    ))}
  </div>
);
