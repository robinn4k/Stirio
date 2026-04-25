// Stirio Service Registry — promise-based access to async-loaded modules.
//
// Replaces the setTimeout polling pattern in app.jsx that waits for window.st*
// modules. Modules call register('stLearn', mod) when they finish importing,
// and consumers either:
//   - await ready('stLearn')               → Promise<module>
//   - get('stLearn')                       → module | undefined (sync)
//   - has('stLearn')                       → boolean
//
// In Phase 0, this module is created but not yet wired into index.html. Phase 3
// migrates index.html and consumers.

const registry = new Map();
const waiters = new Map();

export function register(name, value) {
  if (!name || typeof name !== 'string') {
    throw new Error('services.register: name must be a non-empty string');
  }
  registry.set(name, value);
  const arr = waiters.get(name);
  if (arr) {
    waiters.delete(name);
    arr.forEach(resolve => {
      try { resolve(value); } catch (err) { console.error('[services] waiter error:', err); }
    });
  }
  if (typeof window !== 'undefined' && window.dispatchEvent) {
    try {
      window.dispatchEvent(new CustomEvent('stirio:service-ready', { detail: { name } }));
    } catch {}
  }
}

export function get(name) {
  return registry.get(name);
}

export function has(name) {
  return registry.has(name);
}

export function list() {
  return Array.from(registry.keys());
}

// ready(name) — resolves immediately if registered, otherwise waits.
// Optional { timeout } in ms; rejects if not registered before then.
export function ready(name, { timeout = 0 } = {}) {
  if (registry.has(name)) return Promise.resolve(registry.get(name));
  return new Promise((resolve, reject) => {
    const arr = waiters.get(name) || [];
    arr.push(resolve);
    waiters.set(name, arr);
    if (timeout > 0) {
      setTimeout(() => {
        if (registry.has(name)) return; // resolved meanwhile
        const list = waiters.get(name);
        if (list) {
          const idx = list.indexOf(resolve);
          if (idx >= 0) list.splice(idx, 1);
        }
        reject(new Error(`Service "${name}" not ready after ${timeout}ms`));
      }, timeout);
    }
  });
}

// React hook — returns the service or null until it's registered.
// Components re-render when the service becomes available.
//
// Requires React on window. Pass `{ React }` to override (useful for tests).
export function useService(name, opts = {}) {
  const React = opts.React || (typeof window !== 'undefined' ? window.React : null);
  if (!React) throw new Error('useService requires React (pass { React } or expose window.React)');
  const [val, setVal] = React.useState(() => registry.get(name) ?? null);
  React.useEffect(() => {
    if (val) return undefined;
    let cancelled = false;
    ready(name).then(v => { if (!cancelled) setVal(v); });
    return () => { cancelled = true; };
  }, [name, val]);
  return val;
}

// Test/teardown helper.
export function _clear() {
  registry.clear();
  waiters.clear();
}
