import { clx, Input } from '@cms/ui';
import type { Control } from 'react-hook-form';
import type { z } from 'zod';
import { useTranslation } from '../../../i18n';
import type { EmailSchema } from '../../../lib/schemas';
import { Form } from '../../common/form';

export type EmailFieldValues = z.infer<typeof EmailSchema>;

export type EmailFormProps = {
  control: Control<EmailFieldValues>;
  layout?: 'grid' | 'stack';
};

export const EmailForm = ({ control, layout = 'stack' }: EmailFormProps) => {
  const { t } = useTranslation();

  return (
    <div
      className={clx('gap-4', {
        'flex flex-col': layout === 'stack',
        'grid grid-cols-1 sm:grid-cols-2': layout === 'grid',
      })}
    >
      <Form.Field
        control={control}
        name="email"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('fields.email')}</Form.Label>
            <Form.Control>
              <Input {...field} type="email" autoComplete="email" />
            </Form.Control>
            <Form.ErrorMessage />
          </Form.Item>
        )}
      />
    </div>
  );
};
