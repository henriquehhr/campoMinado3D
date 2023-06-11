export type Position = {
  x: number;
  y: number;
  z: number;
}

export type FieldStatus = 'covered' | 'uncovered' | 'flagged';

export type Field = {
  status: FieldStatus,
  mine: boolean,
  adjacentMines: number
}

export type FieldToUncover = Position & Field;

export interface ClickResponse {
  fieldsToUncover: FieldToUncover[];
  gameOver?: 'win' | 'loss';
  mineFields?: Position[];
}