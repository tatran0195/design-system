import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { InfiniteList } from '../components/common/infinite-list';
import { Query } from '../components/filtering/query';
import { ChipInput } from '../components/inputs/chip-input';
import { ProvinceSelect } from '../components/inputs/province-select';
import { useCombinedRefs } from '../hooks/use-combined-refs';
import { useInfiniteList } from '../hooks/use-infinite-list';
import { useIntersectionObserver } from '../hooks/use-intersection-observer';
import { useMediaQuery } from '../hooks/use-media-query';

const client = () => new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });

describe('refs, observers, and responsive hooks', () => {
  it('keeps composed refs stable and honors React 19 cleanup callbacks', () => {
    const object = createRef<HTMLDivElement>();
    const cleanup = vi.fn();
    const callback = vi.fn(() => cleanup);
    function Probe({ title }: { title: string }) {
      const ref = useCombinedRefs(object, callback, undefined, null);
      return <div ref={ref}>{title}</div>;
    }
    const { rerender, unmount } = render(<Probe title="First" />);
    const node = object.current;
    rerender(<Probe title="Second" />);
    expect(object.current).toBe(node);
    expect(callback).toHaveBeenCalledTimes(1);
    unmount();
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(object.current).toBeNull();
  });
  it('clears legacy callback refs with null on unmount', () => {
    const callback = vi.fn();
    function Probe() {
      return <div ref={useCombinedRefs(callback)} />;
    }
    const { unmount } = render(<Probe />);
    unmount();
    expect(callback).toHaveBeenLastCalledWith(null);
  });
  it('creates observers in an effect, uses the latest handler, and ignores disconnected callbacks', () => {
    const instances: { callback: (entries: { isIntersecting: boolean }[]) => void; disconnect: ReturnType<typeof vi.fn> }[] = [];
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        disconnect = vi.fn();
        observe = vi.fn();
        constructor(callback: (typeof instances)[number]['callback']) {
          instances.push({ callback, disconnect: this.disconnect });
        }
      },
    );
    const first = vi.fn();
    const second = vi.fn();
    const node = document.createElement('div');
    const { result, rerender, unmount } = renderHook(({ onIntersect, enabled }) => useIntersectionObserver({ onIntersect, enabled }), {
      initialProps: { onIntersect: first, enabled: true },
    });
    expect(instances).toHaveLength(0);
    act(() => result.current(node));
    expect(instances).toHaveLength(1);
    rerender({ onIntersect: second, enabled: true });
    act(() => instances[0].callback([{ isIntersecting: true }]));
    expect(second).toHaveBeenCalledTimes(1);
    expect(first).not.toHaveBeenCalled();
    rerender({ onIntersect: second, enabled: false });
    expect(instances[0].disconnect).toHaveBeenCalledTimes(1);
    act(() => instances[0].callback([{ isIntersecting: true }]));
    expect(second).toHaveBeenCalledTimes(1);
    unmount();
  });
  it('subscribes once and cleans up matchMedia events', () => {
    const add = vi.fn();
    const remove = vi.fn();
    const media = { matches: true, addEventListener: add, removeEventListener: remove };
    vi.spyOn(window, 'matchMedia').mockReturnValue(media as unknown as MediaQueryList);
    const { result, rerender, unmount } = renderHook(() => useMediaQuery('(min-width: 800px)'));
    expect(result.current).toBe(true);
    rerender();
    expect(add).toHaveBeenCalledTimes(1);
    unmount();
    expect(remove).toHaveBeenCalledTimes(1);
  });
});
describe('input semantics', () => {
  it('updates controlled query text immediately but debounces the search callback', () => {
    vi.useFakeTimers();
    const search = vi.fn();
    function Probe() {
      const [value, setValue] = useState('');
      return <Query value={value} onChange={setValue} onSearch={search} debounceMs={100} />;
    }
    render(<Probe />);
    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'a' } });
    expect(input).toHaveValue('a');
    act(() => vi.advanceTimersByTime(50));
    fireEvent.change(input, { target: { value: 'ab' } });
    expect(input).toHaveValue('ab');
    act(() => vi.advanceTimersByTime(99));
    expect(search).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(search).toHaveBeenCalledExactlyOnceWith('ab');
  });
  it('cancels an unmounted query debounce', () => {
    vi.useFakeTimers();
    const search = vi.fn();
    const { unmount } = render(<Query onSearch={search} />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'pending' } });
    unmount();
    act(() => vi.runAllTimers());
    expect(search).not.toHaveBeenCalled();
  });
  it('supports accessible native attributes and removes only one duplicate chip', () => {
    render(<ChipInput aria-label="Tags" defaultValue={['one', 'one']} allowDuplicates />);
    expect(screen.getByRole('textbox', { name: 'Tags' })).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Remove one' })[0]);
    expect(screen.getAllByText('one')).toHaveLength(1);
  });
  it('keeps disabled chip remove buttons disabled and ignores composing Enter', () => {
    const change = vi.fn();
    const { rerender } = render(<ChipInput aria-label="Tags" defaultValue={['one']} disabled onChange={change} />);
    expect(screen.getByRole('button', { name: 'Remove one' })).toBeDisabled();
    rerender(<ChipInput aria-label="Tags" onChange={change} />);
    const input = screen.getByRole('textbox', { name: 'Tags' });
    fireEvent.change(input, { target: { value: '日本語' } });
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    expect(change).not.toHaveBeenCalled();
  });
  it('forwards province-select labels and refs and accepts custom options', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<ProvinceSelect ref={ref} aria-label="Province" defaultValue="custom" options={[{ value: 'custom', label: 'Custom region' }]} />);
    expect(ref.current).toBe(screen.getByRole('combobox', { name: 'Province' }));
    expect(screen.getByText('Custom region')).toBeInTheDocument();
  });
});
describe('query-client-backed infinite lists', () => {
  it('loads pages through the accessible fallback without IntersectionObserver', async () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const queryClient = client();
    const load = vi.fn(async ({ offset, limit }: { offset?: number; limit?: number }, signal?: AbortSignal) => ({
      count: 3,
      offset: offset!,
      limit: limit!,
      items: offset === 0 ? ['one', 'two'] : ['three'],
    }));
    render(
      <QueryClientProvider client={queryClient}>
        <InfiniteList
          queryKey={['items']}
          queryFn={load}
          pageSize={2}
          selectItems={(page) => page.items}
          renderItem={(item) => item}
          getKey={(item) => item}
        />
      </QueryClientProvider>,
    );
    expect(await screen.findByText('one')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Load more' }));
    expect(await screen.findByText('three')).toBeInTheDocument();
    expect(load).toHaveBeenLastCalledWith({ offset: 2, limit: 2 }, expect.any(AbortSignal));
    expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument();
    queryClient.clear();
  });
  it('has retryable initial errors', async () => {
    const queryClient = client();
    let attempt = 0;
    const load = async () => {
      if (!attempt++) throw new Error('offline');
      return { count: 0, offset: 0, limit: 20, items: [] as string[] };
    };
    render(
      <QueryClientProvider client={queryClient}>
        <InfiniteList queryKey={['error']} queryFn={load} selectItems={(page) => page.items} renderItem={(item) => item} getKey={(item) => item} />
      </QueryClientProvider>,
    );
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load records.');
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByText('No records.')).toBeInTheDocument();
    queryClient.clear();
  });
  it('does not claim a disabled query is busy or call its loader', () => {
    const queryClient = client();
    const load = vi.fn();
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <InfiniteList enabled={false} queryKey={['disabled']} queryFn={load} selectItems={() => []} renderItem={() => null} getKey={() => ''} />
      </QueryClientProvider>,
    );
    expect(container.firstChild).toHaveAttribute('aria-busy', 'false');
    expect(load).not.toHaveBeenCalled();
    queryClient.clear();
  });
  it('sanitizes zero page sizes and stops on a malformed non-advancing response', async () => {
    const queryClient = client();
    const load = vi.fn(async () => ({ count: 100, offset: 0, limit: 0 }));
    const { result } = renderHook(() => useInfiniteList({ queryKey: ['zero'], queryFn: load, query: { limit: 0 } }), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(load).toHaveBeenCalledWith({ limit: 50, offset: 0 }, expect.any(AbortSignal));
    expect(result.current.hasNextPage).toBe(false);
    queryClient.clear();
  });
  it('separates infinite cache entries by page size', async () => {
    const queryClient = client();
    const load = vi.fn(async ({ limit = 1, offset = 0 }) => ({ count: 0, limit, offset }));
    const { result, rerender } = renderHook(({ limit }) => useInfiniteList({ queryKey: ['sizes'], queryFn: load, query: { limit } }), {
      initialProps: { limit: 2 },
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    rerender({ limit: 5 });
    await waitFor(() => expect(load).toHaveBeenCalledTimes(2));
    expect(load).toHaveBeenLastCalledWith({ limit: 5, offset: 0 }, expect.any(AbortSignal));
    queryClient.clear();
  });
});
