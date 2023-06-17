<script lang="ts">
  import { flaggedFields } from './store.js';
  export let numberOfMines: number;
</script>

<div>
  {$flaggedFields} / {numberOfMines}
</div>

<style>
</style>
