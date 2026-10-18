'use client';

import { Minus, Plus } from '@cms/icons';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import setObjValue from '@/utils/set-obj-value';
import { Button } from '../../../../components/Button';
import { ApiRunnerParamInput, type ApiRunnerParamInputProps } from '../Default';

export const ApiRunnerParamArrayInput = ({ paramName, paramValue, objPath, setValue }: ApiRunnerParamInputProps) => {
  const [itemsValue, setItemsValue] = useState<typeof paramValue>(paramValue);

  useEffect(() => {
    setValue((prev: unknown) =>
      typeof prev === 'object' && !Array.isArray(prev)
        ? setObjValue({
            obj: { ...prev },
            value: itemsValue,
            path: `${objPath.length ? `${objPath}.` : ''}${paramName}`,
          })
        : itemsValue,
    );
  }, [itemsValue, setValue, paramName, objPath.length, objPath]);

  if (!Array.isArray(paramValue)) {
    return <ApiRunnerParamInput paramName={paramName} paramValue={paramValue} objPath={objPath} setValue={setValue} />;
  }

  return (
    <fieldset className={clsx('border border-cms-border-strong rounded', 'p-docs_0.5')}>
      <legend className="px-docs_0.5">
        <code>{paramName}</code> Array Items
      </legend>
      {(itemsValue as unknown[]).map((value, index) => (
        <div key={index} className={clsx(index > 0 && 'flex gap-docs_0.5 items-center justify-center mt-docs_0.5')}>
          <ApiRunnerParamInput paramName={`[${index}]`} paramValue={value} objPath={''} setValue={setItemsValue} />
          {index > 0 && (
            <Button
              buttonType="icon"
              variant="secondary"
              onClick={() => {
                setItemsValue((prev: unknown[]) => prev.splice(index, 1));
              }}
              className="mt-0.5"
              data-testid="minus-button"
            >
              <Minus />
            </Button>
          )}
        </div>
      ))}
      <Button
        buttonType="icon"
        variant="secondary"
        onClick={() => {
          setItemsValue((prev: unknown[]) => [
            ...prev,
            Array.isArray(prev[0]) ? [...prev[0]] : typeof prev[0] === 'object' ? { ...prev[0] } : prev[0],
          ]);
        }}
        className="mt-0.5"
        data-testid="plus-button"
      >
        <Plus />
      </Button>
    </fieldset>
  );
};
