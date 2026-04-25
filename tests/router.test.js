import { describe, it, expect, beforeEach, vi } from 'vitest';

const router = await import('../js/router.js');

beforeEach(() => {
  router._clear();
  router.defineRoutes({
    home: { title: 'Home' },
    profile: { parent: 'home' },
    'academy-hub': { parent: 'home' },
    'academy-track': { parent: 'academy-hub' },
    lesson: { overlay: true, hidesNav: true },
  });
});

describe('defineRoutes / getRoute', () => {
  it('registers routes and exposes metadata', () => {
    expect(router.getRoute('home').title).toBe('Home');
    expect(router.getRoute('profile').parent).toBe('home');
  });

  it('returns null for unknown route', () => {
    expect(router.getRoute('nope')).toBeNull();
  });

  it('lists registered routes', () => {
    expect(router.listRoutes()).toContain('home');
    expect(router.listRoutes()).toContain('lesson');
  });
});

describe('navigate / getCurrent / getStack', () => {
  it('starts with an empty stack', () => {
    expect(router.getCurrent()).toBeNull();
    expect(router.getStack()).toEqual([]);
  });

  it('pushes routes onto the stack', () => {
    router.navigate('home');
    router.navigate('profile');
    expect(router.getCurrent().name).toBe('profile');
    expect(router.getStack()).toHaveLength(2);
  });

  it('passes params through', () => {
    router.navigate('lesson', { lesson: { id: 7 } });
    expect(router.getCurrent().params.lesson.id).toBe(7);
  });

  it('refuses unknown routes and warns', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(router.navigate('mystery')).toBe(false);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe('back', () => {
  it('pops top of stack', () => {
    router.navigate('home');
    router.navigate('profile');
    router.back();
    expect(router.getCurrent().name).toBe('home');
  });

  it('falls back to declared parent when stack has only one entry', () => {
    router.navigate('academy-track');
    router.back();
    expect(router.getCurrent().name).toBe('academy-hub');
  });

  it('returns false at root with no parent', () => {
    router.navigate('home');
    expect(router.back()).toBe(false);
    expect(router.getCurrent().name).toBe('home');
  });
});

describe('replace / reset', () => {
  it('replace swaps the top entry', () => {
    router.navigate('home');
    router.navigate('profile');
    router.replace('academy-hub');
    expect(router.getStack()).toHaveLength(2);
    expect(router.getCurrent().name).toBe('academy-hub');
  });

  it('reset clears the stack to a single entry', () => {
    router.navigate('home');
    router.navigate('profile');
    router.navigate('lesson');
    router.reset('home');
    expect(router.getStack()).toEqual([{ name: 'home', params: {} }]);
  });
});

describe('subscribe', () => {
  it('notifies listeners on every navigation', () => {
    const fn = vi.fn();
    const off = router.subscribe(fn);
    router.navigate('home');
    router.navigate('profile');
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn.mock.calls[1][0].name).toBe('profile');
    off();
  });

  it('stops notifying after unsubscribe', () => {
    const fn = vi.fn();
    router.subscribe(fn)();
    router.navigate('home');
    expect(fn).not.toHaveBeenCalled();
  });

  it('isolates listener errors from other listeners', () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const ok = vi.fn();
    router.subscribe(() => { throw new Error('boom'); });
    router.subscribe(ok);
    router.navigate('home');
    expect(ok).toHaveBeenCalled();
    err.mockRestore();
  });
});
