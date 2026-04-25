import { describe, it, expect, beforeEach } from 'vitest';

const steps = await import('../js/lesson-steps.js');

beforeEach(() => steps._clear());

describe('register / get / has', () => {
  it('registers and retrieves a step component', () => {
    const Intro = () => null;
    steps.register('intro', Intro);
    expect(steps.has('intro')).toBe(true);
    expect(steps.get('intro')).toBe(Intro);
  });

  it('returns null for unknown kinds', () => {
    expect(steps.get('mystery')).toBeNull();
    expect(steps.has('mystery')).toBe(false);
  });

  it('lists registered kinds', () => {
    steps.register('intro', () => null);
    steps.register('choice', () => null);
    expect(steps.list().sort()).toEqual(['choice', 'intro']);
  });

  it('overwrites existing registrations (last wins)', () => {
    const A = () => null;
    const B = () => null;
    steps.register('intro', A);
    steps.register('intro', B);
    expect(steps.get('intro')).toBe(B);
  });

  it('rejects empty kind', () => {
    expect(() => steps.register('', () => null)).toThrow();
  });

  it('rejects non-function components', () => {
    expect(() => steps.register('bad', 'not a component')).toThrow();
  });
});

describe('unregister', () => {
  it('removes the component', () => {
    steps.register('intro', () => null);
    expect(steps.unregister('intro')).toBe(true);
    expect(steps.get('intro')).toBeNull();
  });

  it('returns false when removing unknown kind', () => {
    expect(steps.unregister('ghost')).toBe(false);
  });
});
