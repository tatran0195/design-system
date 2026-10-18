import type React from 'react';
import { CheckNote } from './Types/checks';
import { DefaultNote } from './Types/default';
import { ErrorNote } from './Types/error';
import { SoonNote } from './Types/soon';
import { SuccessNote } from './Types/sucess';
import { WarningNote } from './Types/warning';

export type NoteProps = {
  type?: 'default' | 'warning' | 'success' | 'error' | 'check' | 'soon';
  title?: string;
  children?: React.ReactNode;
  forceMultiline?: boolean;
};

export const Note = ({ type = 'default', ...props }: NoteProps) => {
  switch (type) {
    case 'warning':
      return <WarningNote type={type} {...props} />;
    case 'success':
      return <SuccessNote type={type} {...props} />;
    case 'error':
      return <ErrorNote type={type} {...props} />;
    // TODO remove both once we've removed all notes using them
    case 'check':
      return <CheckNote type={type} {...props} />;
    case 'soon':
      return <SoonNote type={type} {...props} />;
    default:
      return <DefaultNote type={type} {...props} />;
  }
};
