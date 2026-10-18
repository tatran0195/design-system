import type { NoteProps } from '..';
import { NoteLayout } from '../Layout';

export const DefaultNote = ({ title = 'Note', ...props }: NoteProps) => <NoteLayout title={title} {...props} />;
