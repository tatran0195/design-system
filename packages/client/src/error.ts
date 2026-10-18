/**
 * Structured error thrown by every CmsClient method.
 *
 * Mirrors the backend `AppError` shape:
 *   { message: string, code?: string, status?: number }
 */
export class CmsApiError extends Error {
  readonly status: number;
  readonly code: string | undefined;

  constructor(message: string, status = 500, code?: string) {
    super(message);
    this.name = 'CmsApiError';
    this.status = status;
    this.code = code;
  }

  /** True when the server returned a 401 — caller should redirect to login. */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  /** True when the server returned a 403. */
  get isForbidden(): boolean {
    return this.status === 403;
  }

  /** True when the server returned a 404. */
  get isNotFound(): boolean {
    return this.status === 404;
  }

  /** True when the server returned a 409 (e.g. duplicate email). */
  get isConflict(): boolean {
    return this.status === 409;
  }

  /** True when the server returned a 422 or 400. */
  get isValidation(): boolean {
    return this.status === 400 || this.status === 422;
  }

  /** True when the server returned a 5xx. */
  get isServerError(): boolean {
    return this.status >= 500;
  }
}

/** Shape of the JSON error body returned by cms-server. */
interface ApiErrorBody {
  message?: string;
  code?: string;
  status?: number;
}

/**
 * Parses a non-ok ky `HTTPError` response into a `CmsApiError`.
 * Call this inside an `afterResponse` hook or a catch block.
 */
export async function parseCmsError(response: Response): Promise<CmsApiError> {
  let body: ApiErrorBody = {};
  try {
    body = (await response.json()) as ApiErrorBody;
  } catch {
    // non-JSON body — fall through with defaults
  }
  return new CmsApiError(body.message ?? `Request failed with status ${response.status}`, response.status, body.code);
}
