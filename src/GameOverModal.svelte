<script lang="ts">
  import { gameOverStatus } from './store.js';

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
</dialog>

<style>
</style>
