import { Field, Position, FieldStatus, ClickResponse } from "./types";
import { random } from "./utils";

export default class MineSweeper3D {
  fields: Field[][][];
  mineFields: Position[];
  adjacentFields: Position[];
  coveredSafeFields: number;

  constructor(public readonly x: number, public readonly y: number, public readonly z: number, public readonly numberOfMines: number) {
    this.fields = [];
    this.mineFields = [];
    this.adjacentFields = [];
    this.coveredSafeFields = (x * y * z) - numberOfMines;

    this.initializeFields();
    this.randomizeMines();
    this.calculateAdjacentFieldPositions();
    this.calculateNumberOfAdjacentMinesPerField();
  }

  private initializeFields() {
    for (let i = 0; i < this.x; i++) {
      const line: Array<any> = [];
      this.fields.push(line);
      for (let j = 0; j < this.y; j++) {
        const column: Array<any> = [];
        this.fields[i].push(column);
        for (let k = 0; k < this.z; k++) {
          const field: Field = { status: 'covered', mine: false, adjacentMines: 0 };
          this.fields[i][j].push(field);
        }
      }
    }
  }

  private randomizeMines() {
    let temp: Position;
    let mineAlreadyExistsInThisPosition: boolean;
    for (let i = 0; i < this.numberOfMines; i++) {
      do {
        temp = {
          x: random(0, this.x - 1),
          y: random(0, this.y - 1),
          z: random(0, this.z - 1),
        };
        mineAlreadyExistsInThisPosition = this.fields[temp.x][temp.y][temp.z].mine;
      } while (mineAlreadyExistsInThisPosition);
      this.mineFields.push(temp);
      this.fields[temp.x][temp.y][temp.z].mine = true;
    }
  }

  private calculateAdjacentFieldPositions() {
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        for (let k = -1; k <= 1; k++) {
          const position = { x: i, y: j, z: k };
          this.adjacentFields.push(position);
        }
      }
    }
    const innerFieldArrayPosition = 13;
    this.adjacentFields.splice(innerFieldArrayPosition, 1);
  }

  private calculateNumberOfAdjacentMinesPerField() {
    let x, y, z;
    this.mineFields.forEach(mine => {
      this.adjacentFields.forEach(adjacent => {
        x = mine.x + adjacent.x;
        y = mine.y + adjacent.y;
        z = mine.z + adjacent.z;
        if (this.fields[x] === undefined) return;
        if (this.fields[x][y] === undefined) return;
        if (this.fields[x][y][z] === undefined) return;
        this.fields[x][y][z].adjacentMines++;
      });
    });
  }

  public flagAField(p: Position): FieldStatus {
    const status = this.fields[p.x][p.y][p.z].status;
    if (status == 'uncovered') return 'uncovered';
    this.fields[p.x][p.y][p.z].status = status == 'covered' ? 'flagged' : 'covered';
    return this.fields[p.x][p.y][p.z].status;
  }

  public clickField(p: Position): ClickResponse {
    const response: ClickResponse = {
      fieldsToUncover: []
    };
    response.fieldsToUncover = this.uncoverField(p);
    if (this.coveredSafeFields === 0)
      response.gameOver = 'win';
    let gameLoss;
    for (const field of response.fieldsToUncover) {
      for (const mine of this.mineFields) {
        if (field.x == mine.x && field.y == mine.y && field.z == mine.z)
          gameLoss = true;
      }
    }
    if (gameLoss)
      response.gameOver = 'loss';
    return response;
  }

  private uncoverField(p: Position): Position[] {
    const field = this.fields[p.x][p.y][p.z];
    if (field.status == 'flagged' || field.status == 'uncovered') return [];
    field.status = 'uncovered';
    if (!field.mine)
      this.coveredSafeFields--;
    if (field.adjacentMines === 0) {
      const adjacents = this.uncoverAdjacentFields(p);
      return [p, ...adjacents];
    }
    return [p];
  }

  private uncoverAdjacentFields(p: Position): Position[] {
    let uncoveredFields: Position[] = [];
    let x, y, z;
    for (const adjacent of this.adjacentFields) {
      x = p.x + adjacent.x;
      y = p.y + adjacent.y;
      z = p.z + adjacent.z;
      if (this.fields[x] === undefined) continue;
      if (this.fields[x][y] === undefined) continue;
      if (this.fields[x][y][z] === undefined) continue;
      if (this.fields[x][y][z].status == 'covered') {
        const uncoveredField = this.uncoverField({ x, y, z });
        uncoveredFields = [...uncoveredFields, ...uncoveredField];
      }
    }
    return uncoveredFields;
  }

  public selectAdjacentFields(p: Position): Position[] | undefined {
    const field = this.fields[p.x][p.y][p.z];
    if (field.status == 'uncovered' || field.status == 'flagged') return;
    let x, y, z, adjacentFlags = 0;
    this.adjacentFields.forEach(adjacent => {
      x = p.x + adjacent.x;
      y = p.y + adjacent.y;
      z = p.z + adjacent.z;
      if (this.fields[x] === undefined) return;
      if (this.fields[x][y] === undefined) return;
      if (this.fields[x][y][z] === undefined) return;
      if (this.fields[x][y][z].status == 'flagged')
        adjacentFlags++;
    });
    if (adjacentFlags == field.adjacentMines) {
      return this.uncoverAdjacentFields(p);
    }
  }

}