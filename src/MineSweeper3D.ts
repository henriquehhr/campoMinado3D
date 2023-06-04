import { Position } from "./types";
import { random } from "./utils";

export default class MineSweeper3D {
  x: number;
  y: number;
  z: number;
  numberOfMines: number;
  fields: Array<any>;
  mineFields: Array<Position>;
  adjacentFields: Array<Position>;

  constructor(x: number, y: number, z: number, numberOfMines: number) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.numberOfMines = numberOfMines;

    this.fields = [];
    this.mineFields = [];
    this.adjacentFields = [];

    this.initializeFields();
    this.randomizeMines();
    this.calculateAdjacentFieldPositions();
    this.calculateNumberOfAdjacentMinesPerField();
  }

  initializeFields() {
    for (let i = 0; i < this.x; i++) {
      const line: Array<any> = [];
      this.fields.push(line);
      for (let j = 0; j < this.y; j++) {
        const column: Array<any> = [];
        this.fields[i].push(column);
        for (let k = 0; k < this.z; k++) {
          this.fields[i][j].push(0);
        }
      }
    }
  }

  randomizeMines() {
    let temp: Position;
    let mineAlreadyExistsInThisPosition: boolean;
    for (let i = 0; i < this.numberOfMines; i++) {
      do {
        temp = {
          x: random(0, this.x - 1),
          y: random(0, this.y - 1),
          z: random(0, this.z - 1),
        };
        mineAlreadyExistsInThisPosition = this.mineFields.some(mine => mine.x == temp.x && mine.y == temp.y && mine.z == temp.z);
      } while (mineAlreadyExistsInThisPosition);
      this.mineFields.push(temp);
    }
  }

  calculateAdjacentFieldPositions() {
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

  calculateNumberOfAdjacentMinesPerField() {
    this.mineFields.forEach(mine => {
      this.adjacentFields.forEach(adjacent => {
        if (this.fields[mine.x + adjacent.x] === undefined) return;
        if (this.fields[mine.x + adjacent.x][mine.y + adjacent.y] === undefined) return;
        if (this.fields[mine.x + adjacent.x][mine.y + adjacent.y][mine.z + adjacent.z] === undefined)
          return;
        this.fields[mine.x + adjacent.x][mine.y + adjacent.y][mine.z + adjacent.z]++;
      });
    });
  }
}