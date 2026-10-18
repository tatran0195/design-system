import { z } from 'zod';
import { siteSnapshotSchema } from './site';
export const gitPreviewResponseSchema = z.object({ snapshot: siteSnapshotSchema });
