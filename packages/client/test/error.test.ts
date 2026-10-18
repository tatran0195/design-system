import { CmsApiError, parseCmsError } from '../src/error.js';
import { describe, expect, it } from 'bun:test';

describe('CmsApiError', () => {
  it('creates error with message, status, and code', () => {
    const err = new CmsApiError('Invalid password', 401, 'INVALID_CREDENTIALS');
    expect(err.name).toBe('CmsApiError');
    expect(err.message).toBe('Invalid password');
    expect(err.status).toBe(401);
    expect(err.code).toBe('INVALID_CREDENTIALS');
    expect(err.isUnauthorized).toBe(true);
    expect(err.isForbidden).toBe(false);
  });

  it('evaluates status flags correctly', () => {
    expect(new CmsApiError('err', 403).isForbidden).toBe(true);
    expect(new CmsApiError('err', 404).isNotFound).toBe(true);
    expect(new CmsApiError('err', 409).isConflict).toBe(true);
    expect(new CmsApiError('err', 400).isValidation).toBe(true);
    expect(new CmsApiError('err', 422).isValidation).toBe(true);
    expect(new CmsApiError('err', 500).isServerError).toBe(true);
    expect(new CmsApiError('err', 503).isServerError).toBe(true);
    expect(new CmsApiError('err', 200).isServerError).toBe(false);
  });
});

describe('parseCmsError', () => {
  it('parses JSON error response with code and message', async () => {
    const response = new Response(
      JSON.stringify({
        message: 'Email already taken',
        code: 'DUPLICATE_EMAIL',
      }),
      { status: 409, headers: { 'Content-Type': 'application/json' } },
    );

    const err = await parseCmsError(response);
    expect(err).toBeInstanceOf(CmsApiError);
    expect(err.message).toBe('Email already taken');
    expect(err.status).toBe(409);
    expect(err.code).toBe('DUPLICATE_EMAIL');
    expect(err.isConflict).toBe(true);
  });

  it('handles non-JSON error response gracefully', async () => {
    const response = new Response('Bad Gateway', { status: 502 });
    const err = await parseCmsError(response);
    expect(err).toBeInstanceOf(CmsApiError);
    expect(err.message).toBe('Request failed with status 502');
    expect(err.status).toBe(502);
    expect(err.isServerError).toBe(true);
  });
});
