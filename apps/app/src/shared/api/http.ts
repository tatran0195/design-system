export interface RequestArguments {
  param?: Record<string, string>;
  query?: Record<string, string | number | boolean | string[] | undefined>;
  json?: unknown;
  form?: Record<string, string | Blob>;
}
export interface RequestOptions extends RequestInit {
  init?: RequestInit;
}
export interface ApiResponse extends Response {
  json(): Promise<{ data: unknown; error?: unknown }>;
}

/** Same HTTP envelope, paths, methods, credentials and locale header as Nibleaf RPC.
 * Frontend-only: importing the app never imports a Nibleaf server/database workspace. */
export function createHttpTransport(transport: {
  origin: () => string;
  headers?: () => HeadersInit;
  fetch?: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
}) {
  return function endpoint(path: string) {
    function url(args: RequestArguments = {}) {
      const origin = transport.origin();
      const resolved = path.replace(/:([A-Za-z][\w]*)/g, (_match, name: string) => {
        const value = args.param?.[name];
        if (value === undefined) throw new Error(`Missing API path parameter: ${name}`);
        return encodeURIComponent(value);
      });
      const result = new URL(resolved, origin);
      for (const [key, value] of Object.entries(args.query ?? {})) {
        if (value === undefined) continue;
        if (Array.isArray(value))
          value.forEach((item) => {
            result.searchParams.append(key, item);
          });
        else result.searchParams.set(key, String(value));
      }
      return result;
    }
    async function send(method: string, args: RequestArguments = {}, options: RequestOptions = {}): Promise<ApiResponse> {
      const { init, ...fetchOptions } = options;
      const headers = new Headers(init?.headers ?? fetchOptions.headers);
      new Headers(transport.headers?.()).forEach((value, key) => {
        headers.set(key, value);
      });
      let body: BodyInit | undefined;
      if (args.json !== undefined) {
        headers.set('content-type', 'application/json');
        body = JSON.stringify(args.json);
      }
      if (args.form) {
        const form = new FormData();
        for (const [key, value] of Object.entries(args.form)) form.append(key, value);
        body = form;
      }
      return (transport.fetch ?? globalThis.fetch)(url(args), { credentials: 'include', ...fetchOptions, ...init, method, headers, body });
    }
    return {
      $get: (args?: RequestArguments, options?: RequestOptions) => send('GET', args, options),
      $post: (args?: RequestArguments, options?: RequestOptions) => send('POST', args, options),
      $put: (args?: RequestArguments, options?: RequestOptions) => send('PUT', args, options),
      $patch: (args?: RequestArguments, options?: RequestOptions) => send('PATCH', args, options),
      $delete: (args?: RequestArguments, options?: RequestOptions) => send('DELETE', args, options),
      $url: (args?: RequestArguments) => url(args),
    };
  };
}
