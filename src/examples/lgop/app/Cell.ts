
import RootLog from "loglevel";
import Location from "./Location";
import Point from "./Point";

const Log = RootLog.getLogger("lgop.Point");

export default class Cell {
  private row: number;
  private col: number;
  private min_z: number;
  private max_z: number;
  private locations: Array<Location>;
  private static cells: Array<Array<Cell>> = [];
  private static min_row: number = 0;
  private static max_row: number = 0;
  private static min_col: number = 0;
  private static max_col: number = 0;

  constructor(row: number, col: number) {
    if (Cell.cells[row][col]) {
      throw new Error(`cell ${row}.${col} already exists`);
    }
    this.row = row;
    this.col = col;
    this.locations = [];
    this.min_z = 0;
    this.max_z = 0;
  }


  public addLocation(location: Location, z: number): number {
    z = this.findBestZ(z);
    this.locations[z] = location;
    this.min_z = Math.min(this.min_z, z);
    this.max_z = Math.max(this.max_z, z);
    return z;
  }


  public static clear(): void {
    Cell.cells = [];
    Cell.min_col = 0;
    Cell.max_col = 0;
    Cell.min_row = 0;
    Cell.max_row = 0;
  }


  public findBestZ(z: number): number {
    while (this.locations[z]) {
      z += 1;
    }
    return z;
  }


  public static getCell(row: number, col: number): Cell {
    if (!Cell.cells[row]) {
      Cell.cells[row] = [];
    }
    if (!Cell.cells[row][col]) {
      Cell.cells[row][col] = new Cell(row, col);
    }
    Cell.min_row = Math.min(Cell.min_row, row);
    Cell.max_row = Math.max(Cell.max_row, row);
    Cell.min_col = Math.min(Cell.min_col, col);
    Cell.max_col = Math.max(Cell.max_col, col);
    return Cell.cells[row][col];
  }


  public static getMaxZInCol(col: number): number {
    let max_z: number = 0;
    for (let row: number = Cell.min_row; row <= Cell.max_row; row += 1) {
      if (Cell.cells[row][col]) {
        max_z = Math.max(max_z, Cell.cells[row][col].max_z);
      }
    }
    return max_z;
  }


  public static getMaxZInRow(row: number): number {
    let max_z: number = 0;
    for (let col: number = Cell.min_col; col <= Cell.max_col; col += 1) {
      if (Cell.cells[row][col]) {
        max_z = Math.max(max_z, Cell.cells[row][col].max_z);
      }
    }
    return max_z;
  }


  public static getMinZInCol(col: number): number {
    let min_z: number = 0;
    for (let row: number = Cell.min_row; row <= Cell.max_row; row += 1) {
      if (Cell.cells[row][col]) {
        min_z = Math.min(min_z, Cell.cells[row][col].min_z);
      }
    }
    return min_z;
  }


  public static getMinZInRow(row: number): number {
    let min_z: number = 0;
    for (let col: number = Cell.min_col; col <= Cell.max_col; col += 1) {
      if (Cell.cells[row][col]) {
        min_z = Math.min(min_z, Cell.cells[row][col].min_z);
      }
    }
    return min_z;
  }


  public getPosition(z?: number): Point {
    let x: number = 120 + (100 * ((z || 0) - Cell.getMinZInCol(this.col)));
    let y: number =  20 + ( 40 * (Cell.getMaxZInRow(this.row) - (z || 0)));
    for (let i = Cell.min_col; i < this.col; i += 1) {
      x += (Cell.getMaxZInCol(i) - Cell.getMinZInCol(i)) * 100 + 150;
    }
    for (let i = Cell.min_row; i < this.row; i += 1) {
      y += (Cell.getMaxZInRow(i) - Cell.getMinZInRow(i)) *  40 +  60;
    }
    return new Point(x, y);
  }


  public static report(): void {

    for (let row: number = Cell.min_row; row <= Cell.max_row; row += 1) {
      for (let col: number = Cell.min_col; col <= Cell.max_col; col += 1) {
        let cell = Cell.cells[row][col];
        if (cell) {
          Log.debug(`cell ${row}, ${col}: ${cell.min_z} - ${cell.max_z}`);
        }
      }
    }

    for (let i = Cell.min_row; i <= Cell.max_row; i += 1) {
      Log.debug(`row ${i} min: ${Cell.getMinZInRow(i)} max: ${Cell.getMaxZInRow(i)}`);
    }
    for (let i = Cell.min_col; i <= Cell.max_col; i += 1) {
      Log.debug(`col ${i} min: ${Cell.getMinZInCol(i)} max: ${Cell.getMaxZInCol(i)}`);
    }

  }

}
