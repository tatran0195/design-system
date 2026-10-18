import type { NoteProps } from '..';
import { NoteLayout } from '../Layout';

export const ErrorNote = ({ title = 'Error', ...props }: NoteProps) => <NoteLayout title={title} {...props} />;
