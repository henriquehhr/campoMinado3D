<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { type Difficulty } from '../types';

  export let difficulties: Difficulty[];

  let chosenDifficulty = difficulties[0];
  let disabled = false;

  const dispatch = createEventDispatcher();
  function newGame() {
    dispatch('newGame', {
      chosenDifficulty: { ...chosenDifficulty },
    });
  }

  function validateCustomGameConfiguration(difficulty: Difficulty): boolean {
    if (difficulty.name !== 'Custom') return false;
    if (difficulty.rows < 1) return true;
    if (difficulty.collumns < 1) return true;
    if (difficulty.layers < 1) return true;
    if (difficulty.numberOfMines < 1) return true;
    if (difficulty.rows * difficulty.collumns * difficulty.layers < difficulty.numberOfMines)
      return true;
    return false;
  }

  $: disabled = validateCustomGameConfiguration(chosenDifficulty);
</script>

<div id="menu">
  <form on:submit|preventDefault={newGame}>
    {#each difficulties as difficulty}
      <label>
        <input
          type="radio"
          name="difficulty"
          value={difficulty}
          bind:group={chosenDifficulty} />{difficulty.name}
      </label>
    {/each}
    {#if chosenDifficulty.name == 'Custom'}
      <label
        >Rows: <input
          type="number"
          bind:value={chosenDifficulty.rows}
          min={2}
          max={10}
          required /></label>
      <label
        >Collumns: <input
          type="number"
          bind:value={chosenDifficulty.collumns}
          min={2}
          max={10}
          required /></label>
      <label
        >Layers: <input
          type="number"
          bind:value={chosenDifficulty.layers}
          min={1}
          max={10}
          required /></label>
      <label
        >Mines: <input
          type="number"
          bind:value={chosenDifficulty.numberOfMines}
          min={1}
          max={chosenDifficulty.rows * chosenDifficulty.collumns * chosenDifficulty.layers - 1}
          required /></label>
    {/if}
    <button type="submit" {disabled}>New game</button>
    <div class="dash"></div>
    <label><input type="checkbox" /> Animations</label>
  </form>
</div>

<style>
  form {
    font-size: 17px;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  button {
    font-size: 16px;
  }

  input:invalid {
    color: red;
  }

  .dash {
    height: 0px;
    border: 1px solid black;
    margin: 8px 5px 5px 5px;
  }
</style>
