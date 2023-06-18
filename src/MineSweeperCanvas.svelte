<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import MineSweeperCanvas from './MineSweeperCanvas';
  import { clockTime, flaggedFields } from './store.js';

  export let rows = 6;
  export let collumns = 6;
  export let layers = 6;
  export let numberOfMines = 8;

  let canvas: HTMLElement;
  let mineSweeperCanvas: MineSweeperCanvas;
  const updateClockCallback = (time: number) => {
    clockTime.set(time);
  };

  onMount(() => {
    mineSweeperCanvas = new MineSweeperCanvas(
      rows,
      collumns,
      layers,
      numberOfMines,
      updateClockCallback,
      canvas
    );
    mineSweeperCanvas.renderCubes();
    mineSweeperCanvas.addEventListeners();
  });

  onDestroy(() => {
    mineSweeperCanvas.eraseGame();
    clockTime.set(0);
    flaggedFields.reset();
    mineSweeperCanvas = null;
  });
</script>

<canvas id="container" bind:this={canvas} />

<style>
  canvas {
    z-index: -1;
    margin: 0;
    overflow: hidden;
  }
</style>
