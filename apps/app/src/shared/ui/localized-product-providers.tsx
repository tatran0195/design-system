import { type ReactNode, useEffect } from 'react';
import { isRtl, synchronizeDocumentLanguageFn } from '@/shared/i18n';
import { useLocale, useT } from '@/shared/i18n/react';
import { ConfirmProvider as DesignConfirmProvider } from '@/shared/ui/confirm';
import { DirectionProvider } from '@/shared/ui/direction';
import { Toaster } from '@/shared/ui/sonner';
import { TooltipProvider } from '@/shared/ui/tooltip';

export function LocalizedProductProviders({ children }: { children: ReactNode }) {
  const { locale } = useLocale();
  useEffect(() => synchronizeDocumentLanguageFn(locale), [locale]);
  return (
    <DirectionProvider direction={isRtl(locale) ? 'rtl' : 'ltr'}>
      <LocalizedSurfaces>
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster position={isRtl(locale) ? 'bottom-left' : 'bottom-right'} />
      </LocalizedSurfaces>
    </DirectionProvider>
  );
}

function LocalizedSurfaces({ children }: { children: ReactNode }) {
  const t = useT();
  return (
    <DesignConfirmProvider labels={{ cancel: t('common.cancel'), delete: t('common.delete'), save: t('common.save') }}>
      {children}
    </DesignConfirmProvider>
  );
}
