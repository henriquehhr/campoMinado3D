<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  let renderer: 'WebGPU' | 'WebGL';

  const dispatch = createEventDispatcher();

  $: dispatch('startGame', { renderer });
</script>

<div>
  <form>
    <span>Choose your renderer:</span>
    <label><input type="radio" bind:group={renderer} value="WebGPU" /> WebGPU</label>
    <label><input type="radio" bind:group={renderer} value="WebGL" /> WebGL</label>
  </form>
</div>

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: 5px;
    font-size: 17px;
  }
</style>
