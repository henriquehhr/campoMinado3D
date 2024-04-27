<script lang="ts">
  import { clockTime } from '../store';
</script>

<div>{$clockTime}</div>

<style>
  div {
    min-width: 36px;
    display: flex;
    justify-content: end;
    width: min-content;
  }
</style>
