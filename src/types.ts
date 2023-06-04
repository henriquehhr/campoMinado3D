export interface Position {
  x: number;
  y: number;
  z: number;
}

export type FieldStatus = 'covered' | 'uncovered' | 'flagged';

export interface Field {
  status: FieldStatus,
  mine: boolean,
  adjacentMines: number
}


export interface GameOver {
  message: 'You lose' | 'You win';
  mineFields: Array<Position>;
}