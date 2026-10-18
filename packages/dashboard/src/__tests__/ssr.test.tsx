// @vitest-environment node
import { Input } from '@cms/ui';
import { renderToString } from 'react-dom/server';
import { useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import { Form } from '../components/common/form';
import {
  Combobox,
  CountrySelect,
  createDataGridHelper,
  DashboardProvider,
  DataGrid,
  ProtectedRoute,
  PublicLayout,
  UserLink,
  useMediaQuery,
} from '../index';

describe('server portability', () => {
  it('imports the complete entry without browser globals', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof DashboardProvider).toBe('function');
  });
  it('server-renders input, auth, and presentation families without observers or routers', () => {
    expect(() =>
      renderToString(
        <DashboardProvider>
          <PublicLayout>
            <Combobox aria-label="Choose" options={[{ value: 'a', label: 'Alpha' }]} />
            <CountrySelect aria-label="Country" defaultValue="vn" />
            <UserLink name="Alex" />
            <ProtectedRoute status="authenticated">
              <span>Authenticated</span>
            </ProtectedRoute>
          </PublicLayout>
        </DashboardProvider>,
      ),
    ).not.toThrow();
  });
  it('provides deterministic responsive state during SSR', () => {
    function Probe() {
      return <span>{String(useMediaQuery('(min-width: 800px)', true))}</span>;
    }
    expect(renderToString(<Probe />)).toContain('true');
  });
  it('server-renders an empty editable grid using injected form state', () => {
    function Grid() {
      const form = useForm<{ rows: { title: string }[] }>({ defaultValues: { rows: [] } });
      const helper = createDataGridHelper<{ id: string }, { rows: { title: string }[] }>();
      return (
        <DataGrid
          data={[]}
          state={form}
          columns={[
            helper.column({
              id: 'title',
              header: 'Title',
              type: 'text',
              field: ({ row }) => `rows.${row.index}.title`,
              cell: (context) => <DataGrid.TextCell context={context} />,
            }),
          ]}
        />
      );
    }
    expect(() => renderToString(<Grid />)).not.toThrow();
  });
  it('associates custom control, label, and hint IDs in the server HTML before effects', () => {
    function Probe() {
      const form = useForm({ defaultValues: { title: '' } });
      return (
        <Form {...form}>
          <Form.Field
            name="title"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label id="custom-label">Title</Form.Label>
                <Form.Control>
                  <Input {...field} id="custom-input" aria-describedby="external-help" />
                </Form.Control>
                <Form.Hint id="custom-hint">Help</Form.Hint>
              </Form.Item>
            )}
          />
        </Form>
      );
    }
    const html = renderToString(<Probe />);
    expect(html).toContain('for="custom-input"');
    expect(html).toContain('id="custom-input"');
    expect(html).toContain('aria-labelledby="custom-label"');
    expect(html).toContain('aria-describedby="custom-hint external-help"');
  });
});
