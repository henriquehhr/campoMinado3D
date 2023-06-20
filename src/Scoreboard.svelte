<script lang="ts">
  import { clockTime } from './store.js';

  export let difficulty: string;

  let name: string;
  let disabled = false;

  let scoreBoard: { name: string; difficulty: string; time: number }[] | null = JSON.parse(
    localStorage.getItem('score')
  );

  function saveScore(e: KeyboardEvent) {
    if (e.key !== 'Enter') return;
    const score = { name, difficulty, time: $clockTime };
    if (!scoreBoard) localStorage.setItem('score', JSON.stringify([score]));
    else {
      scoreBoard.push(score);
      localStorage.setItem('score', JSON.stringify(scoreBoard));
    }
    disabled = true;
    scoreBoard = scoreBoard;
  }

  $: display =
    difficulty +
    '\n' +
    scoreBoard
      ?.filter((score) => score.difficulty === difficulty)
      .sort((a, b) => a.time - b.time)
      .map(({ name, time }) => `Name: ${name} Time: ${time}`)
      .join('\n');
</script>

<label>Name: <input type="text" bind:value={name} on:keydown={saveScore} {disabled} /></label>
<div class="scoreBoard">{display}</div>

<style>
  .scoreBoard {
    white-space: pre;
  }
</style>
