import { ArrowUpRightOnBox } from '@cms/icons';
import { Badge, Container, Heading, IconButton } from '@cms/ui';
import { useTranslation } from '../../../i18n';
import { Link } from '../../../routing';

type MetadataSectionProps<TData extends object> = {
  data: TData;
  href?: string;
};

export const MetadataSection = <TData extends object>({ data, href }: MetadataSectionProps<TData>) => {
  const { t } = useTranslation();

  if (!data) {
    return null;
  }

  if (!('metadata' in data)) {
    return null;
  }

  const numberOfKeys = data.metadata ? Object.keys(data.metadata).length : 0;

  return (
    <Container className="flex items-center justify-between">
      <div className="flex items-center gap-x-3">
        <Heading level="h2">{t('metadata.header')}</Heading>
        <Badge size="2xsmall" rounded="full">
          {t('metadata.numberOfKeys', {
            count: numberOfKeys,
          })}
        </Badge>
      </div>
      {href && (
        <IconButton size="small" variant="transparent" className="text-ui-fg-muted hover:text-ui-fg-subtle" asChild>
          <Link to={href} aria-label={t('actions.edit')}>
            <ArrowUpRightOnBox />
          </Link>
        </IconButton>
      )}
    </Container>
  );
};
