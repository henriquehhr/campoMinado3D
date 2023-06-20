<script lang="ts">
  import Scoreboard from './Scoreboard.svelte';
  import { gameOverStatus } from './store.js';

  export let difficulty: string;
  let dialog: HTMLDialogElement;

  $: if ($gameOverStatus) {
    dialog.showModal();
  }

  function closeOnOutsideClick(e: MouseEvent) {
    const dialogDimensions = dialog.getBoundingClientRect();
    if (
      e.clientX < dialogDimensions.left ||
      e.clientX > dialogDimensions.right ||
      e.clientY < dialogDimensions.top ||
      e.clientY > dialogDimensions.bottom
    ) {
      dialog.close();
    }
  }
</script>

<dialog bind:this={dialog} on:click={closeOnOutsideClick}>
  <div>{$gameOverStatus}</div>
  {#if $gameOverStatus == 'win'}
    <Scoreboard {difficulty} />
  {/if}
  <button on:click={() => dialog.close()}>Close</button>
</dialog>

<style>
</style>
