<script lang="ts">
  import Clock from './Clock.svelte';
  import GameOverModal from './GameOverModal.svelte';
  import Menu from './Menu.svelte';
  import MineCount from './MineCount.svelte';
  import MineSweeperCanvas from './MineSweeperCanvas.svelte';

  let gameconfiguration = {
    rows: 8,
    collumns: 8,
    layers: 2,
    numberOfMines: 10,
  };

  function handleNewGame(e: CustomEvent) {
    gameconfiguration = e.detail.chosenDifficulty;
  }
</script>

{#key gameconfiguration}
  <MineSweeperCanvas {...gameconfiguration} />
{/key}

<div id="overlay">
  <Clock />
  <MineCount numberOfMines={gameconfiguration.numberOfMines} />
  <Menu on:newGame={handleNewGame} />
</div>
<GameOverModal />

<style>
  #overlay {
    position: absolute;
    top: 25px;
    left: 25px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  #overlay :global(div) {
    padding: 5px;
    background-color: lightgray;
    border-radius: 3px;
  }
</style>
