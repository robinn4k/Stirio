import { describe, it, expect, beforeEach, vi } from 'vitest';

const services = await import('../js/services.js');

beforeEach(() => services._clear());

describe('register / get / has', () => {
  it('registers and reads back synchronously', () => {
    services.register('stLearn', { addXp: () => 10 });
    expect(services.has('stLearn')).toBe(true);
    expect(services.get('stLearn').addXp()).toBe(10);
  });

  it('lists registered services', () => {
    services.register('a', {});
    services.register('b', {});
    expect(services.list()).toEqual(expect.arrayContaining(['a', 'b']));
  });

  it('rejects empty names', () => {
    expect(() => services.register('', {})).toThrow();
  });
});

describe('ready', () => {
  it('resolves immediately if already registered', async () => {
    services.register('stLang', { t: x => x });
    const mod = await services.ready('stLang');
    expect(mod.t('hello')).toBe('hello');
  });

  it('resolves once the service is registered later', async () => {
    const promise = services.ready('stAuth');
    services.register('stAuth', { user: 'me' });
    const mod = await promise;
    expect(mod.user).toBe('me');
  });

  it('resolves multiple waiters with the same value', async () => {
    const p1 = services.ready('multi');
    const p2 = services.ready('multi');
    services.register('multi', { ok: true });
    const [a, b] = await Promise.all([p1, p2]);
    expect(a).toBe(b);
    expect(a.ok).toBe(true);
  });

  it('rejects on timeout if never registered', async () => {
    await expect(services.ready('ghost', { timeout: 5 })).rejects.toThrow(/not ready/);
  });

  it('does not reject if registered before timeout fires', async () => {
    const p = services.ready('justInTime', { timeout: 50 });
    setTimeout(() => services.register('justInTime', 'ok'), 5);
    await expect(p).resolves.toBe('ok');
  });
});

describe('useService', () => {
  // Minimal React stub — vitest runs in Node without DOM.
  function makeReactStub() {
    const states = [];
    let stateIdx = 0;
    const effects = [];
    return {
      useState(init) {
        const i = stateIdx++;
        if (states[i] === undefined) {
          states[i] = typeof init === 'function' ? init() : init;
        }
        return [states[i], (v) => { states[i] = v; }];
      },
      useEffect(fn) { effects.push(fn); },
      _flushEffects() { effects.splice(0).forEach(fn => fn()); },
      _resetIdx() { stateIdx = 0; },
      _states: states,
    };
  }

  it('returns the value immediately if registered', () => {
    services.register('here', 42);
    const React = makeReactStub();
    React._resetIdx();
    const val = services.useService('here', { React });
    expect(val).toBe(42);
  });

  it('returns null first, then resolves once registered', async () => {
    const React = makeReactStub();
    React._resetIdx();
    const first = services.useService('later', { React });
    expect(first).toBeNull();
    React._flushEffects();
    services.register('later', 'arrived');
    await Promise.resolve();
    expect(React._states[0]).toBe('arrived');
  });
});
