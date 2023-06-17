<script lang="ts">
  import Clock from './Clock.svelte';
  import Menu from './Menu.svelte';
  import MineCount from './MineCount.svelte';
  import MineSweeperCanvas from './MineSweeperCanvas.svelte';

  let rows = 6;
  let collumns = 6;
  let layers = 6;
  let numberOfMines = 8;
  let containerID = 'container';
</script>

<MineSweeperCanvas {rows} {collumns} {layers} {numberOfMines} {containerID} />
<div id="overlay">
  <Clock />
  <MineCount {numberOfMines} />
  <Menu />
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
    font-size: 20px;
    display: block;
  }
</style>
