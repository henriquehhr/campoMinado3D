<div id="menu">
  <label><input type="radio" name="difficulty" value="beginner" checked />Beginner</label><br />
  <label><input type="radio" name="difficulty" value="intermediate" />Intermediate</label><br />
  <label><input type="radio" name="difficulty" value="expert" />Expert</label><br />
  <button on:click={() => window.location.reload()}>New game</button>
</div>

<style>
  #menu {
    font-size: 17px;
  }

  input {
    margin-bottom: 10px;
  }

  button {
    font-size: 16px;
  }
</style>
