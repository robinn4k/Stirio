// Stirio Lesson Step Registry — pluggable LessonPlayer step kinds.
//
// Replaces the hardcoded if/else chain in lesson.jsx that maps step.kind
// (intro|choice|multi|ratio|earTrain|cutWords|colorMatch|timing) to its
// React component. Each step file calls register('kind', Component) at load
// time; LessonPlayer reads via get(kind).
//
// Phase 0: created but not yet consumed. Phase 4 splits lesson.jsx into
// js/lesson-steps/*.jsx files that all register here.

const registry = new Map();

export function register(kind, Component) {
  if (!kind || typeof kind !== 'string') {
    throw new Error('lesson-steps.register: kind must be a non-empty string');
  }
  if (typeof Component !== 'function') {
    throw new Error('lesson-steps.register: Component must be a function');
  }
  registry.set(kind, Component);
}

export function get(kind) {
  return registry.get(kind) || null;
}

export function has(kind) {
  return registry.has(kind);
}

export function list() {
  return Array.from(registry.keys());
}

export function unregister(kind) {
  return registry.delete(kind);
}

// Test/teardown helper.
export function _clear() {
  registry.clear();
}
