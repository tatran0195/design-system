import { queryKeys } from '../src/react/query-keys.js';
import { describe, expect, it } from 'bun:test';

describe('queryKeys', () => {
  it('generates structured auth keys', () => {
    expect(queryKeys.auth.all()).toEqual(['auth']);
    expect(queryKeys.auth.me()).toEqual(['auth', 'me']);
  });

  it('generates structured sites keys', () => {
    expect(queryKeys.sites.all()).toEqual(['sites']);
    expect(queryKeys.sites.lists()).toEqual(['sites', 'list']);
    expect(queryKeys.sites.detail('site_123')).toEqual(['sites', 'detail', 'site_123']);
  });

  it('generates structured docs keys', () => {
    expect(queryKeys.docs.all()).toEqual(['docs']);
    expect(queryKeys.docs.lists('site_1')).toEqual(['docs', 'site_1', 'list']);
    expect(queryKeys.docs.detail('site_1', 'page_1')).toEqual(['docs', 'site_1', 'detail', 'page_1']);
    expect(queryKeys.docs.bySlug('site_1', 'intro')).toEqual(['docs', 'site_1', 'slug', 'intro']);
  });

  it('generates structured notifications keys', () => {
    expect(queryKeys.notifications.all()).toEqual(['notifications']);
    expect(queryKeys.notifications.lists({ unread: true })).toEqual(['notifications', 'list', { unread: true }]);
    expect(queryKeys.notifications.unreadCount()).toEqual(['notifications', 'unread-count']);
  });
});
