<script lang="ts">
  import { flaggedFields } from './store.js';
  export let numberOfMines: number;
</script>

<div>
  {$flaggedFields} / {numberOfMines}
</div>

<style>
  div {
    display: flex;
    justify-content: end;
    min-width: 36px;
    width: min-content;
  }
</style>
