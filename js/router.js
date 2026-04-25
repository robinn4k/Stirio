// Stirio Router — declarative route table + stack-based navigation.
//
// The router is a pure state machine: it knows about route names, params,
// and a navigation stack. It does NOT render anything — components subscribe
// via subscribe() (or via a useRouter() hook in app.jsx) and read getCurrent()
// to decide what to render.
//
// Routes are registered with defineRoutes({ name: { parent, hidesNav, overlay,
// title, ... } }). The metadata is opaque to the router; consumers read it.
//
// Phase 0: this module is created but no consumers exist yet. Phase 1 migrates
// app.jsx to use it.

const listeners = new Set();
let routes = {};
let stack = [];

export function defineRoutes(routesMap) {
  routes = { ...routes, ...(routesMap || {}) };
}

export function getRoute(name) {
  return routes[name] || null;
}

export function listRoutes() {
  return Object.keys(routes);
}

export function getCurrent() {
  return stack[stack.length - 1] || null;
}

export function getStack() {
  return stack.slice();
}

export function navigate(name, params = {}) {
  if (!routes[name]) {
    console.warn(`[router] unknown route: ${name}`);
    return false;
  }
  stack.push({ name, params });
  notify();
  return true;
}

export function replace(name, params = {}) {
  if (!routes[name]) {
    console.warn(`[router] unknown route: ${name}`);
    return false;
  }
  if (stack.length > 0) stack.pop();
  stack.push({ name, params });
  notify();
  return true;
}

export function reset(name, params = {}) {
  if (!routes[name]) {
    console.warn(`[router] unknown route: ${name}`);
    return false;
  }
  stack = [{ name, params }];
  notify();
  return true;
}

// Pop the top of the stack. If the current route declares a `parent`
// and the parent is not on the stack, navigate to it instead.
export function back() {
  if (stack.length <= 1) {
    const current = getCurrent();
    const parent = current && routes[current.name]?.parent;
    if (parent && routes[parent]) {
      stack = [{ name: parent, params: {} }];
      notify();
      return true;
    }
    return false;
  }
  stack.pop();
  notify();
  return true;
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Test/teardown helper.
export function _clear() {
  stack = [];
  routes = {};
  listeners.clear();
}

function notify() {
  const current = getCurrent();
  listeners.forEach(fn => {
    try { fn(current); } catch (err) { console.error('[router] listener error:', err); }
  });
  if (typeof window !== 'undefined' && window.dispatchEvent) {
    try {
      window.dispatchEvent(new CustomEvent('stirio:routechange', {
        detail: { current, stack: stack.slice() }
      }));
    } catch {}
  }
}
