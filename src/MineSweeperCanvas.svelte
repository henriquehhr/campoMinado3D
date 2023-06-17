<script lang="ts">
  import MineSweeperCanvas from './MineSweeperCanvas';
  import { clockTime } from './store.js';

  export let rows = 6;
  export let collumns = 6;
  export let layers = 6;
  export let numberOfMines = 8;
  export let containerID = 'container';

  export let updateClockCallback = (time: number) => {
    clockTime.set(time);
  };

  const mineSweeperCanvas = new MineSweeperCanvas(
    rows,
    collumns,
    layers,
    numberOfMines,
    updateClockCallback,
    containerID
  );
  mineSweeperCanvas.renderCubes();
  mineSweeperCanvas.addEventListeners();
</script>
