import { describe, it, expect, beforeEach, vi } from 'vitest';

const store = await import('../js/store.js');

beforeEach(() => store._clear());

describe('registerEffect / dispatch', () => {
  it('runs registered effects for matching action type', async () => {
    const fn = vi.fn();
    store.registerEffect('PING', fn);
    await store.dispatch({ type: 'PING', payload: 1 });
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn.mock.calls[0][0]).toEqual({ type: 'PING', payload: 1 });
  });

  it('runs multiple effects in registration order', async () => {
    const calls = [];
    store.registerEffect('SEQ', () => calls.push('a'));
    store.registerEffect('SEQ', () => calls.push('b'));
    store.registerEffect('SEQ', () => calls.push('c'));
    await store.dispatch({ type: 'SEQ' });
    expect(calls).toEqual(['a', 'b', 'c']);
  });

  it('awaits async effects in series', async () => {
    const calls = [];
    store.registerEffect('ASYNC', async () => {
      await new Promise(r => setTimeout(r, 10));
      calls.push('first');
    });
    store.registerEffect('ASYNC', () => calls.push('second'));
    await store.dispatch({ type: 'ASYNC' });
    expect(calls).toEqual(['first', 'second']);
  });

  it('continues running effects when one throws', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const after = vi.fn();
    store.registerEffect('FAIL', () => { throw new Error('boom'); });
    store.registerEffect('FAIL', after);
    const results = await store.dispatch({ type: 'FAIL' });
    expect(results[0].ok).toBe(false);
    expect(results[1].ok).toBe(true);
    expect(after).toHaveBeenCalled();
    err.mockRestore();
  });

  it('returns each effect result', async () => {
    store.registerEffect('RES', () => 'x');
    store.registerEffect('RES', async () => 'y');
    const results = await store.dispatch({ type: 'RES' });
    expect(results.map(r => r.result)).toEqual(['x', 'y']);
  });

  it('does nothing for action types with no effects', async () => {
    const results = await store.dispatch({ type: 'NOPE' });
    expect(results).toEqual([]);
  });

  it('rejects malformed actions', async () => {
    await expect(store.dispatch(null)).rejects.toThrow();
    await expect(store.dispatch({})).rejects.toThrow();
    await expect(store.dispatch({ type: '' })).rejects.toThrow();
  });
});

describe('registerEffect returns unsubscribe', () => {
  it('removes the effect when called', async () => {
    const fn = vi.fn();
    const off = store.registerEffect('GONE', fn);
    off();
    await store.dispatch({ type: 'GONE' });
    expect(fn).not.toHaveBeenCalled();
  });
});

describe('introspection', () => {
  it('reports effect counts and known types', () => {
    store.registerEffect('A', () => {});
    store.registerEffect('A', () => {});
    store.registerEffect('B', () => {});
    expect(store.getEffectCount('A')).toBe(2);
    expect(store.getEffectCount('B')).toBe(1);
    expect(store.getEffectCount('C')).toBe(0);
    expect(store.listActionTypes().sort()).toEqual(['A', 'B']);
  });
});
