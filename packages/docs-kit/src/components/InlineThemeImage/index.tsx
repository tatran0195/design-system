import clsx from 'clsx';
import { ThemeImage, type ThemeImageProps } from '@/components/ThemeImage';

export const InlineThemeImage = (props: ThemeImageProps) => (
  <ThemeImage {...props} width={20} height={20} className={clsx(props.className, 'inline')} />
);
