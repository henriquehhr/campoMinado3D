<script lang="ts">
  import Clock from './Clock.svelte';
  import GameOverModal from './GameOverModal.svelte';
  import Menu from './Menu.svelte';
  import MineCount from './MineCount.svelte';
  import MineSweeperCanvas from './MineSweeperCanvas.svelte';
  import RendererPicker from './RendererPicker.svelte';
  import { clockTime, flaggedFields, gameOverStatus, renderer } from '../store.js';

  const difficulties = [
    {
      name: 'Begginer',
      rows: 5,
      collumns: 5,
      layers: 5,
      numberOfMines: 5,
    },
    {
      name: 'Intermediate',
      rows: 6,
      collumns: 6,
      layers: 6,
      numberOfMines: 12,
    },
    {
      name: 'Expert',
      rows: 8,
      collumns: 8,
      layers: 6,
      numberOfMines: 25,
    },
    {
      name: 'Custom',
      rows: 5,
      collumns: 5,
      layers: 5,
      numberOfMines: 1,
    },
  ];

  let gameconfiguration = difficulties[0];
  let startGame: 'WebGPU' | 'WebGL;';

  function handleNewGame(e: CustomEvent) {
    clockTime.set(0);
    flaggedFields.reset();
    gameOverStatus.reset();
    gameconfiguration = e.detail.chosenDifficulty;
  }

  function handleStartGame(e: CustomEvent) {
    startGame = e.detail.renderer;
    renderer.set(e.detail.renderer);
  }
</script>

{#if startGame}
  <MineSweeperCanvas {gameconfiguration} />
{/if}

<div id="overlay">
  <Clock />
  <MineCount numberOfMines={gameconfiguration.numberOfMines} />
  <Menu on:newGame={handleNewGame} {difficulties} />
  <RendererPicker on:startGame={handleStartGame} />
</div>
<GameOverModal difficulty={gameconfiguration.name} />

<style>
  #overlay {
    position: absolute;
    top: 25px;
    left: 25px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  #overlay :global(> div) {
    padding: 5px;
    background-color: lightgray;
    border-radius: 3px;
  }
</style>
