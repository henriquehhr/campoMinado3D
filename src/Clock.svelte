<script lang="ts">
  import { clockTime } from './store';
</script>

<div>{$clockTime}</div>

<style>
  div {
    min-height: 23px;
    min-width: 36px;
    display: flex;
    justify-content: end;
  }
</style>
