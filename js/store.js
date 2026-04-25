// Stirio Store — action bus with ordered, awaitable effects.
//
// Replaces the inline side-effect chains in app.jsx (e.g. finishLesson() runs
// XP, profile sync, activity, academy progress, achievements, leaderboard
// in series with no rollback or trace). Effects register against an action
// type and run in registration order; failures are logged but don't break
// the chain.
//
// dispatch(action) → resolves with [{ ok, result | error }, ...].
//
// Phase 0: created but no actions wired yet. Phase 2 migrates finishLesson.

const effects = new Map();

export function registerEffect(type, fn) {
  if (!type || typeof type !== 'string') {
    throw new Error('store.registerEffect: type must be a non-empty string');
  }
  if (typeof fn !== 'function') {
    throw new Error('store.registerEffect: fn must be a function');
  }
  const arr = effects.get(type) || [];
  arr.push(fn);
  effects.set(type, arr);
  return () => {
    const list = effects.get(type);
    if (!list) return;
    const idx = list.indexOf(fn);
    if (idx >= 0) list.splice(idx, 1);
    if (list.length === 0) effects.delete(type);
  };
}

export async function dispatch(action) {
  if (!action || typeof action !== 'object' || !action.type) {
    throw new Error('store.dispatch: action must be { type: string, ... }');
  }
  const list = effects.get(action.type) || [];
  const results = [];
  for (const fn of list) {
    try {
      const result = await fn(action);
      results.push({ ok: true, result });
    } catch (err) {
      console.error(`[store] effect for ${action.type} failed:`, err);
      results.push({ ok: false, error: err });
    }
  }
  if (typeof window !== 'undefined' && window.dispatchEvent) {
    try {
      window.dispatchEvent(new CustomEvent('stirio:action', {
        detail: { action, results }
      }));
    } catch {}
  }
  return results;
}

export function getEffectCount(type) {
  return (effects.get(type) || []).length;
}

export function listActionTypes() {
  return Array.from(effects.keys());
}

// Test/teardown helper.
export function _clear(type) {
  if (type) effects.delete(type);
  else effects.clear();
}
