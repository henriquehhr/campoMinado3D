<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  let difficulty = 'beginner';

  const dispatch = createEventDispatcher();

  function newGame() {
    dispatch('newGame', {
      difficulty,
    });
  }
</script>

<div id="menu">
  <label
    ><input
      type="radio"
      name="difficulty"
      value="beginner"
      bind:group={difficulty} />Beginner</label>
  <label
    ><input
      type="radio"
      name="difficulty"
      value="intermediate"
      bind:group={difficulty} />Intermediate</label>
  <label
    ><input type="radio" name="difficulty" value="expert" bind:group={difficulty} />Expert</label>
  <button on:click={newGame}>New game</button>
</div>

<style>
  #menu {
    font-size: 17px;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  button {
    font-size: 16px;
  }
</style>
