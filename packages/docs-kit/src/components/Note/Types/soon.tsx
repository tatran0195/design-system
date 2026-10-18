import type { NoteProps } from '..';
import { NoteLayout } from '../Layout';

export const SoonNote = ({ title = 'Coming soon', ...props }: NoteProps) => <NoteLayout title={title} {...props} />;
