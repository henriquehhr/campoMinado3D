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

function createGameOver() {
  const { subscribe, set } = writable(null);

  return {
    subscribe,
    set: (status: string) => set(status),
    reset: () => set(null)
  };
}

export const clockTime = createTime();
export const flaggedFields = createFlaggedFields();
export const gameOverStatus = createGameOver();