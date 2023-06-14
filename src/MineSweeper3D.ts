import { Field, Position, FieldStatus, ClickResponse, FieldToUncover } from "./types";
import { random } from "./utils";

export default class MineSweeper3D {
  fields: Field[][][] = [];
  mineFields: Position[] = [];
  adjacentFields: Position[] = [];
  wronglyFlaggedFields: Position[] = [];
  flaggedMines: Position[] = [];
  coveredSafeFields: number;
  interval = 0;
  clock = 0;
  firstClick = true;
  gameOver = false;

  constructor(public readonly x: number, public readonly y: number, public readonly z: number, public readonly numberOfMines: number, public readonly updateClockCallback: (time: number) => void) {
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
    this.mineFields.forEach(mine => {
      this.fields[mine.x][mine.y][mine.z].adjacentMines = -1;
    });
  }

  public flagAField(p: Position): FieldStatus {
    const field = this.fields[p.x][p.y][p.z];
    const status = field.status;
    if (this.gameOver) return status;
    if (status == 'uncovered') return 'uncovered';
    field.status = status == 'covered' ? 'flagged' : 'covered';
    if (field.status == 'flagged' && !field.mine)
      this.wronglyFlaggedFields.push(p);
    else if (field.status == 'covered' && !field.mine)
      this.wronglyFlaggedFields.splice(this.wronglyFlaggedFields.findIndex(field => p.x == field.x && p.y == field.y && p.z == field.z), 1);
    return this.fields[p.x][p.y][p.z].status;
  }

  public clickField(p: Position): ClickResponse {
    const response: ClickResponse = {
      fieldsToUncover: []
    };
    if (this.gameOver)
      return response;
    if (this.firstClick) {
      this.interval = setInterval(() => {
        this.clock++;
        this.updateClockCallback(this.clock);
      }, 1000);
    }
    // if (this.firstClick && this.fields[p.x][p.y][p.z].mine)
    //   this.changePositionOfFirstMine(p);
    this.firstClick = false;
    response.fieldsToUncover = this.uncoverField(p);
    if (this.coveredSafeFields === 0) {
      response.gameOver = 'win';
      clearInterval(this.interval);
    }
    let gameLoss = false;
    for (const field of response.fieldsToUncover) {
      for (const mine of this.mineFields) {
        if (field.x == mine.x && field.y == mine.y && field.z == mine.z) {
          gameLoss = true;
          break;
        }
      }
    }
    if (gameLoss) {
      response.gameOver = 'loss';
      clearInterval(this.interval);
      const unflaggedMines: Position[] = [];
      const flaggedMines: Position[] = [];
      this.mineFields.forEach(({ x, y, z }) => {
        if (this.fields[x][y][z].status === 'flagged')
          flaggedMines.push({ x, y, z });
        else
          unflaggedMines.push({ x, y, z });
      });

      response.unflaggedMines = unflaggedMines;
      response.flaggedMines = flaggedMines;
      response.wronglyFlaggedFields = this.wronglyFlaggedFields;
    }
    if (response.gameOver)
      this.gameOver = true;
    return response;
  }

  private changePositionOfFirstMine(p: Position) { //TODO arrumar função.
    let temp: Position;
    let mineAlreadyExistsInThisPosition: boolean;
    do {
      temp = {
        x: random(0, this.x - 1),
        y: random(0, this.y - 1),
        z: random(0, this.z - 1),
      };
      mineAlreadyExistsInThisPosition = this.fields[temp.x][temp.y][temp.z].mine;
    } while (mineAlreadyExistsInThisPosition);
    this.mineFields.push(temp);
    this.mineFields = this.mineFields.filter(mine => mine.x != temp.x && mine.y != temp.y && mine.z != temp.z);
    this.fields[temp.x][temp.y][temp.z].mine = true;
    let x, y, z;
    this.adjacentFields.forEach(adjacent => {
      x = temp.x + adjacent.x;
      y = temp.y + adjacent.y;
      z = temp.z + adjacent.z;
      if (this.fields[x] === undefined) return;
      if (this.fields[x][y] === undefined) return;
      if (this.fields[x][y][z] === undefined) return;
      this.fields[x][y][z].adjacentMines++;
    });
    this.fields[p.x][p.y][p.z].mine = false;
    this.fields[p.x][p.y][p.z].adjacentMines = -1;
    this.adjacentFields.forEach(adjacent => {
      x = p.x + adjacent.x;
      y = p.y + adjacent.y;
      z = p.z + adjacent.z;
      if (this.fields[x] === undefined) return;
      if (this.fields[x][y] === undefined) return;
      if (this.fields[x][y][z] === undefined) return;
      this.fields[x][y][z].adjacentMines--;
    });
  }

  private uncoverField(p: Position): FieldToUncover[] {
    const field = this.fields[p.x][p.y][p.z];
    if (field.status == 'flagged' || field.status == 'uncovered') return [];
    field.status = 'uncovered';
    if (!field.mine)
      this.coveredSafeFields--;
    if (field.adjacentMines === 0) {
      const adjacents = this.uncoverAdjacentFields(p);
      return [{ ...p, ...field }, ...adjacents];
    }
    return [{ ...p, ...field }];
  }

  private uncoverAdjacentFields(p: Position): FieldToUncover[] {
    let uncoveredFields: any[] = [];
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