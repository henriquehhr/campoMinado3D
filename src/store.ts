import { writable } from 'svelte/store';

function createTime() {
  const { subscribe, set } = writable(0);

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
  const { subscribe, set } = writable('');

  return {
    subscribe,
    set: (status: string) => set(status),
    reset: () => set('')
  };
}

function createRenderer() {
  const { subscribe, set } = writable('');

  return {
    subscribe,
    set: (renderer: string) => set(renderer),
    value() {
      let valor: string;
      this.subscribe((x: string) => valor = x)
      return valor;
    }
  };
}

export const clockTime = createTime();
export const flaggedFields = createFlaggedFields();
export const gameOverStatus = createGameOver();
export let renderer = createRenderer();