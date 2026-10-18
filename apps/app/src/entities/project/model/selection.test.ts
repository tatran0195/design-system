import { expect, it } from 'vitest';
import { selectActiveProject } from './selection';

it('uses a valid user preference without copying the remote list', () => {
  const projects = [{ id: 'one' }, { id: 'two' }];
  expect(selectActiveProject(projects, 'two')).toBe(projects[1]);
});
it('derives the first available project for a stale or missing preference', () => {
  const projects = [{ id: 'one' }];
  expect(selectActiveProject(projects, 'gone')).toBe(projects[0]);
  expect(selectActiveProject(projects, null)).toBe(projects[0]);
});
it('represents an empty query result explicitly', () => {
  expect(selectActiveProject([], null)).toBeNull();
});
