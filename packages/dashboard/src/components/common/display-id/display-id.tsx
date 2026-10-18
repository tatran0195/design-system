import { clx, Tooltip, toast } from '@cms/ui';
import copy from 'copy-to-clipboard';
import { useState } from 'react';
import { useTranslation } from '../../../i18n';

type DisplayIdProps = {
  id: string;
  className?: string;
};

function DisplayId({ id, className }: DisplayIdProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const onClick = () => {
    copy(id);
    toast.success(t('actions.idCopiedToClipboard'));
  };

  return (
    <Tooltip maxWidth={260} content={id} open={open} onOpenChange={setOpen}>
      <span onClick={onClick} className={clx('cursor-pointer', className)}>
        #{id.slice(-7)}
      </span>
    </Tooltip>
  );
}

export default DisplayId;
