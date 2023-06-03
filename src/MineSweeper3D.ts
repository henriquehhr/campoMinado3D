import { random } from "./utils";

export default class MineSweeper3D {
  x: number;
  y: number;
  z: number;
  numberOfMines: number;
  fields: Array<any>;
  mineFields: Array<any>;
  adjacentFields: Array<any>;

  constructor(x: number, y: number, z: number, numberOfMines: number) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.numberOfMines = numberOfMines;

    this.fields = [];
    this.mineFields = [];
    this.adjacentFields = [];

    this.initializrFields();
    this.randomizeMines();
    this.calculateAdjacentFieldPositions();
    this.calculateNumberOfAdjacentMinesPerField();
    console.log(this.mineFields);
  }

  initializrFields() {
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
    let temp: any;
    let mineAlreadyExistsInThisPosition;
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
    for (let i = 0; i < this.numberOfMines; i++) {
      let mine = this.mineFields[i];
      for (let j = 0; j < this.adjacentFields.length; j++) {
        let adjacent = this.adjacentFields[j];
        if (this.fields[mine.x + adjacent.x] === undefined) continue;
        if (this.fields[mine.x + adjacent.x][mine.y + adjacent.y] === undefined) continue;
        if (this.fields[mine.x + adjacent.x][mine.y + adjacent.y][mine.z + adjacent.z] === undefined)
          continue;
        this.fields[mine.x + adjacent.x][mine.y + adjacent.y][mine.z + adjacent.z]++;
      }
    }
  }
}