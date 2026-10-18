import { z } from 'zod';

const errorEnvelope = z.object({
  error: z
    .object({
      code: z.string().optional(),
      message: z.string().optional(),
      details: z
        .object({ errors: z.array(z.union([z.string(), z.object({ path: z.string().optional(), message: z.string().optional() })])).optional() })
        .optional(),
    })
    .optional(),
});

const readApiError = async (res: Response, fallback: string) => {
  try {
    const parsed = errorEnvelope.safeParse(await res.json());
    if (!parsed.success) return { code: undefined, message: fallback };
    const body = parsed.data;
    const message = body.error?.message ?? fallback;
    const issue = body.error?.details?.errors?.[0];
    const detailMessage = typeof issue === 'string' ? issue : issue?.message;
    const detailPath = typeof issue === 'string' ? undefined : issue?.path;
    if (detailMessage) {
      return {
        code: body.error?.code,
        message: `${message} ${detailPath && detailPath !== '$' ? `${detailPath}: ` : ''}${detailMessage}`,
      };
    }
    return { code: body.error?.code, message };
  } catch {
    return { code: undefined, message: fallback };
  }
};

export class ApiResponseError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiResponseError';
  }
}

/** Success bodies without an owned decoder are a programmer error, not trusted DTOs. */
export class ApiContractError extends ApiResponseError {
  constructor(operation: string, status: number) {
    super(`Invalid service response for ${operation}.`, status, 'api:invalid_response');
    this.name = 'ApiContractError';
  }
}
export const acknowledgementSchema = z.unknown();
async function decodeData<Output>(res: Response, operation: string, schema: z.ZodType<Output>): Promise<Output> {
  if (!schema) throw new Error('An owned response decoder is required.');
  if (res.status === 204 && schema === acknowledgementSchema) return schema.parse(undefined);
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new ApiContractError(operation, res.status);
  }
  const envelope = z.object({ data: z.unknown() }).safeParse(body);
  if (!envelope.success || !Object.hasOwn(body ?? {}, 'data')) {
    if (schema === acknowledgementSchema && body !== null && typeof body === 'object' && !Array.isArray(body)) return schema.parse(undefined);
    throw new ApiContractError(operation, res.status);
  }
  const result = schema.safeParse(envelope.data.data);
  if (!result.success) throw new ApiContractError(operation, res.status);
  return result.data;
}
export async function getData<Output>(res: Response, what: string, schema: z.ZodType<Output>, fallback?: string): Promise<Output> {
  if (!res.ok) {
    const error = await readApiError(res, fallback ?? `Failed to load ${what}.`);
    throw new ApiResponseError(error.message, res.status, error.code);
  }
  return decodeData(res, what, schema);
}
export async function mutateData<Output>(res: Response, fallback: string, schema: z.ZodType<Output>): Promise<Output> {
  if (!res.ok) {
    const error = await readApiError(res, fallback);
    throw new ApiResponseError(error.message, res.status, error.code);
  }
  return decodeData(res, 'mutation', schema);
}
