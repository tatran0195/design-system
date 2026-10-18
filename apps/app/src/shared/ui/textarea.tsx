import { Textarea as CmsTextarea } from '@cms/ui';
import { type ComponentProps, forwardRef } from 'react';
export const Textarea = forwardRef<HTMLTextAreaElement, ComponentProps<typeof CmsTextarea>>(function Textarea(props, ref) {
  return <CmsTextarea {...props} ref={ref} />;
});
