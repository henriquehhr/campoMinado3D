<script lang="ts">
  import { onMount } from 'svelte';
  import MineSweeperCanvas from './MineSweeperCanvas';
  import { clockTime } from './store.js';
  import { type Difficulty } from './types';

  export let gameconfiguration: Difficulty;

  let canvas: HTMLElement;
  let mineSweeperCanvas: MineSweeperCanvas;
  const updateClockCallback = (time: number) => {
    clockTime.set(time);
  };

  onMount(() => {
    const { rows, collumns, layers, numberOfMines } = gameconfiguration;
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
    mineSweeperCanvas.animate();
  });

  function resetGame(gameconfiguration: Difficulty) {
    if (!mineSweeperCanvas) return;
    const { rows, collumns, layers, numberOfMines } = gameconfiguration;
    mineSweeperCanvas.newGame(rows, collumns, layers, numberOfMines, updateClockCallback);
    mineSweeperCanvas.renderCubes();
  }

  $: resetGame(gameconfiguration);
</script>

<canvas id="container" bind:this={canvas} />

<style>
  canvas {
    z-index: -1;
    display: block;
  }
</style>
