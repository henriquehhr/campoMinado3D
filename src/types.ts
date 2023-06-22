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

export type FieldToUncover = Position & Field & { distance: number };

export interface ClickResponse {
  fieldsToUncover: FieldToUncover[];
  gameOver?: 'win' | 'loss';
  unflaggedMines?: Position[];
  flaggedMines?: Position[];
  wronglyFlaggedFields?: Position[];
}

export interface Difficulty {
  name: string;
  rows: number;
  collumns: number;
  layers: number;
  numberOfMines: number;
}