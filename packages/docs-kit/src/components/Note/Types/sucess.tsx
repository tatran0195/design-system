import type { NoteProps } from '..';
import { NoteLayout } from '../Layout';

export const SuccessNote = ({ title = 'Sucess', ...props }: NoteProps) => <NoteLayout title={title} {...props} />;
