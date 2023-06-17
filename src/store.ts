import { writable } from 'svelte/store';

function createTime() {
  const { subscribe, set, update } = writable(0);

  return {
    subscribe,
    set: (time: number) => set(time),
    reset: () => set(0)
  };
}

function createFlaggedFields() {
  const { subscribe, set, update } = writable(0);

  return {
    subscribe,
    increment: () => update(n => n + 1),
    decrement: () => update(n => n - 1),
    reset: () => set(0)
  };
}

export const clockTime = createTime();
export const flaggedFields = createFlaggedFields();