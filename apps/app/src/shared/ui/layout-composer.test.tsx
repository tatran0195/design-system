// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, expect, it } from 'vitest';
import { LayoutComposer, overviewLayout, workspaceLayout } from '@/shared/ui/layout-composer';

afterEach(cleanup);

it('preserves workspace section order and leaves out empty sections', () => {
  const { container } = render(
    <LayoutComposer
      layout={workspaceLayout}
      sections={{
        content: <section>Sites</section>,
        header: <h1>Workspace</h1>,
        metrics: <section>Metrics</section>,
        traffic: <section>Traffic</section>,
      }}
    />,
  );
  expect(container.textContent).toBe('WorkspaceMetricsTrafficSites');
  expect(container.firstElementChild?.className).toBe('flex flex-col gap-6');
  expect(container.querySelectorAll('section')).toHaveLength(3);
});

it('retains the overview column breakpoints and keeps notices before content', () => {
  const { container } = render(
    <LayoutComposer
      layout={overviewLayout}
      sections={{
        header: <h1>Project</h1>,
        notices: <div>Publish failed</div>,
        live: <div>Live site</div>,
        activity: <div>Deployments</div>,
        metrics: <div>Metrics</div>,
        traffic: <div>Traffic</div>,
        content: <div>Pages</div>,
        sidebar: <nav>Manage</nav>,
      }}
    />,
  );
  expect(container.textContent).toBe('ProjectPublish failedLive siteDeploymentsMetricsTrafficPagesManage');
  expect(container.querySelector('.lg\\:grid-cols-\\[1fr_1\\.4fr\\]')).not.toBeNull();
  expect(container.querySelector('.lg\\:grid-cols-\\[1fr_320px\\]')).not.toBeNull();
  expect(screen.getByRole('navigation').textContent).toBe('Manage');
});

it('keeps entry state when host data and conditional notices change', () => {
  function Counter() {
    const [count, setCount] = useState(0);
    return <button onClick={() => setCount(count + 1)}>{count}</button>;
  }
  function Example({ notice }: { notice: boolean }) {
    return (
      <LayoutComposer
        layout={workspaceLayout}
        sections={{
          header: notice ? <div>Notice</div> : null,
          content: (
            <LayoutComposer.Entry id="counter">
              <Counter />
            </LayoutComposer.Entry>
          ),
        }}
      />
    );
  }
  const { rerender } = render(<Example notice={false} />);
  fireEvent.click(screen.getByRole('button'));
  rerender(<Example notice />);
  expect(screen.getByRole('button').textContent).toBe('1');
});
