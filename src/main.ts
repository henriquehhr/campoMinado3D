import MineSweeperCanvas from "./MineSweeperCanvas";

const rows = 6;
const collumns = 6;
const layers = 6;
const numberOfMines = 8;
const containerID = 'container';

let clock = document.querySelector('#clock');
const updateClockCallback = (time: number) => (clock ?? document.createElement('div')).innerHTML = '' + time;

const mineSweeperCanvas = new MineSweeperCanvas(rows, collumns, layers, numberOfMines, updateClockCallback, containerID);
mineSweeperCanvas.renderCubes();
mineSweeperCanvas.addEventListeners();

let scoreboard = document.querySelector('#mines');
if (!scoreboard)
  scoreboard = document.createElement('div');
let flaggedFields = 0;
scoreboard.innerHTML = flaggedFields + ' / ' + numberOfMines;