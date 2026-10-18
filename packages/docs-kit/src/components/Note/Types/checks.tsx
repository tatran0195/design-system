import type { NoteProps } from '..';
import { NoteLayout } from '../Layout';

export const CheckNote = ({ title = 'Prerequisites', ...props }: NoteProps) => <NoteLayout title={title} {...props} />;
