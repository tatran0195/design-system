import { Braces } from 'lucide-react';
import { Children, isValidElement, type ReactNode } from 'react';
export function Steps({ children }: { children?: ReactNode }) {
  const steps = Children.toArray(children).filter(isValidElement);
  return (
    <div className="my-5 flex flex-col gap-6 border-border border-s ps-6">
      {steps.map((step, i) => (
        <div key={step.key} className="relative">
          {/* size-6 chip at -start-9 centers exactly on the 1.5rem rail line. */}
          <span className="-start-9 absolute grid size-6 place-items-center rounded-full border border-border bg-muted font-semibold text-foreground text-xs">
            {i + 1}
          </span>
          {step}
        </div>
      ))}
    </div>
  );
}

export function Step({ title, children }: { title?: string; children?: ReactNode }) {
  return (
    <div className="[&>:first-child]:mt-0 [&>:last-child]:mb-0">
      {title ? <div className="mb-1 font-semibold">{title}</div> : null}
      {children}
    </div>
  );
}

export function ApiExample({ title, children }: { title?: string; children?: ReactNode }) {
  return (
    <section className="my-6 overflow-hidden rounded-xl border border-border" data-theme-component="api-example" aria-label={title}>
      {title ? <div className="border-border border-b bg-muted/40 px-4 py-3 font-semibold">{title}</div> : null}
      <div className="grid grid-cols-1 divide-y divide-border lg:grid-cols-2 lg:divide-x lg:divide-y-0 rtl:lg:divide-x-reverse">{children}</div>
    </section>
  );
}

function ExamplePanel({ title, status, kind, children }: { title?: string; status?: string; kind: 'request' | 'response'; children?: ReactNode }) {
  return (
    <section data-example-kind={kind} className="min-w-0 p-4 [&>:last-child]:mb-0" aria-label={title}>
      {title || status ? (
        <div className="mb-3 flex min-h-6 items-center justify-between gap-3">
          {title ? (
            <div className="flex items-center gap-2 font-semibold text-sm">
              <Braces className="size-4 text-primary" aria-hidden />
              {title}
            </div>
          ) : (
            <span />
          )}
          {status ? <code className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs">{status}</code> : null}
        </div>
      ) : null}
      <div className="[&>:first-child]:mt-0 [&>:last-child]:mb-0">{children}</div>
    </section>
  );
}

export function RequestExample({ title, children }: { title?: string; children?: ReactNode }) {
  return (
    <ExamplePanel title={title} kind="request">
      {children}
    </ExamplePanel>
  );
}

export function ResponseExample({ title, status, children }: { title?: string; status?: string; children?: ReactNode }) {
  return (
    <ExamplePanel title={title} status={status} kind="response">
      {children}
    </ExamplePanel>
  );
}
