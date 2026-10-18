import { z } from 'zod';
import { languageConfigSchema, projectTranslationSchema } from './language-config';
export const textDirectionEnum = z.enum(['LTR', 'RTL']);

export type TextDirection = z.infer<typeof textDirectionEnum>;

export const languageTag = z
  .string()
  .trim()
  .min(2)
  .max(35)
  .refine((value) => {
    try {
      return Intl.getCanonicalLocales(value).length === 1;
    } catch {
      return false;
    }
  }, 'Use a valid BCP-47 code like "en", "pt-BR", or "zh-Hans-CN"')
  .transform((value) => Intl.getCanonicalLocales(value)[0] as string);

export const createLanguageBody = z.object({
  code: languageTag,
  label: z.string().min(1).max(60),
  direction: textDirectionEnum.optional(),
  isDefault: z.boolean().optional(),
  enabled: z.boolean().optional(),
});

export type CreateLanguageBody = z.infer<typeof createLanguageBody>;

export const updateLanguageBody = z.object({
  label: z.string().min(1).max(60).optional(),
  direction: textDirectionEnum.optional(),
  isDefault: z.boolean().optional(),
  enabled: z.boolean().optional(),
  position: z.number().int().optional(),
  config: languageConfigSchema.nullable().optional(),
  translation: projectTranslationSchema.nullable().optional(),
});

export type UpdateLanguageBody = z.infer<typeof updateLanguageBody>;
