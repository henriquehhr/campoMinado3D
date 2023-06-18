<script lang="ts">
  import Clock from './Clock.svelte';
  import Menu from './Menu.svelte';
  import MineCount from './MineCount.svelte';
  import MineSweeperCanvas from './MineSweeperCanvas.svelte';

  let gameconfiguration = {
    rows: 6,
    collumns: 6,
    layers: 6,
    numberOfMines: 8,
  };

  function handleNewGame(e: CustomEvent) {
    const { difficulty } = e.detail;
    if (difficulty == 'beginner') {
      gameconfiguration = {
        rows: 6,
        collumns: 6,
        layers: 6,
        numberOfMines: 8,
      };
    } else if (difficulty == 'intermediate') {
      gameconfiguration = {
        rows: 8,
        collumns: 8,
        layers: 8,
        numberOfMines: 20,
      };
    } else if (difficulty == 'expert') {
      gameconfiguration = {
        rows: 10,
        collumns: 10,
        layers: 10,
        numberOfMines: 70,
      };
    }
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
