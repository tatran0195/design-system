import type React from 'react';
import { Badge } from '@/components/Badge';
import { Tooltip } from '@/components/Tooltip';

export type VersionNoticeProps = {
  version: string;
  tooltipTextClassName?: string;
  badgeClassName?: string;
  badgeContent?: React.ReactNode;
};

export const VersionNotice = ({ version, tooltipTextClassName, badgeClassName, badgeContent = `v${version}` }: VersionNoticeProps) => (
  <Tooltip
    tooltipChildren={
      <span className={tooltipTextClassName}>
        This is available starting from <br />
        <a href={`https://github.com/cms/medusa/releases/tag/${version}`}>CMS v{version}</a>
      </span>
    }
    clickable
  >
    <Badge variant="blue" className={badgeClassName}>
      {badgeContent}
    </Badge>
  </Tooltip>
);
