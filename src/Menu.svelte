<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const difficulties = [
    {
      name: 'Begginer',
      rows: 6,
      collumns: 6,
      layers: 2,
      numberOfMines: 8,
    },
    {
      name: 'Intermediate',
      rows: 6,
      collumns: 6,
      layers: 6,
      numberOfMines: 20,
    },
    {
      name: 'Expert',
      rows: 6,
      collumns: 8,
      layers: 6,
      numberOfMines: 30,
    },
    {
      name: 'Custom',
      rows: 5,
      collumns: 5,
      layers: 5,
      numberOfMines: 5,
    },
  ];
  let chosenDifficulty = difficulties[0];
  let disabled = false;

  const dispatch = createEventDispatcher();
  function newGame() {
    dispatch('newGame', {
      chosenDifficulty,
    });
  }

  function validateCustomGameConfiguration(difficulty): boolean {
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
</style>
