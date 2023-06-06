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

export interface ClickResponse {
  fieldsToUncover: Position[];
  gameOver?: 'win' | 'loss';
}