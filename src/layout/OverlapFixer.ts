
import * as Geom from "geom-api";
import Block from "../core/Block";
import Domain from "../core/Domain";
import ILayout from "./ILayout";


export default class OverlapFixer implements ILayout {
  private cells: Cell[][];
  private max_x: number;
  private max_y: number;
  private min_x: number;
  private min_y: number;

  constructor() {}


  public addBlock(block: Block) {
    const x: number = block.getCentre().getX();
    const y: number = block.getCentre().getY();
    this.makeCellAt(x, y).addBlock(block);
  }


  public beginDomain(Domain: Domain) {
    this.clear();
    Domain.forEachBlock((block: Block) => {
      this.addBlock(block);
    });
  }


  private clear(): void {
    this.cells = [];
    this.max_x = Number.NEGATIVE_INFINITY;
    this.max_y = Number.NEGATIVE_INFINITY;
    this.min_x = Number.POSITIVE_INFINITY;
    this.min_y = Number.POSITIVE_INFINITY;
  }


  public getCellAt(coords: number[]): Cell {
    return this.cells[coords[0]] && this.cells[coords[0]][coords[1]];
  }


  public iterate(): boolean {
    this.loopOverCellsX();
    return false;
  }


  public loopOverCellsX(): void {
    for (let x = this.min_x; x <= this.max_x; x += 1) {
      if (this.cells[x]) {
        this.loopOverCellsY(x);
      }
    }
  }


  public loopOverCellsY(x: number): void {
    for (let y = this.min_y; y <= this.max_y; y += 1) {
      if (this.cells[x][y]) {
        this.cells[x][y].fixOverlaps();
      }
    }
  }


  public makeCellAt(x: number, y: number): Cell {
    if (x < this.min_x) {
      this.min_x = x;
    }
    if (y < this.min_y) {
      this.min_y = y;
    }
    if (x > this.max_x) {
      this.max_x = x;
    }
    if (y > this.max_y) {
      this.max_y = y;
    }
    if (!this.cells[x]) {
      this.cells[x] = [];
    }
    if (!this.cells[x][y]) {
      this.cells[x][y] = new Cell(this, x, y);
    }
    return this.cells[x][y];
  }

}


class Cell {
  private x: number;
  private y: number;
  private blocks: Block[];
  private fixer: OverlapFixer;

  constructor(fixer: OverlapFixer, x: number, y: number) {
    this.blocks = [];
    this.fixer = fixer;
    this.x = x;
    this.y = y;
  }


  public addBlock(block: Block) {
    this.blocks.push(block);
  }


  private addBlockAndSetCoords(block: Block) {
    this.addBlock(block);
    block.setCentre(new Geom.Point(this.x, this.y));
  }


  public fixOverlaps() {
    let i: number = 1;
    if (this.blocks.length > 1) {
      console.log(`overlap detected at ${this.x} ${this.y} - ${this.blocks.length} blocks`);
    }
    while (i < this.blocks.length) {
      let target: Cell = this.findEmptyCell();
      if (target) {
        let move_block: Block = this.blocks.splice(i, 1)[0];
        console.log(`moving ${move_block} to ${target}`);
        target.addBlockAndSetCoords(move_block);
      } else {
        console.log(`OVERLAP NOT FIXED at cell ${this}`);
        i += 1;
      }
    }
  }


  public findEmptyCell(): Cell {
    let cell: Cell;
    let radius: number = 1;
    while (!cell && radius < 5) {
      cell = this.findEmptyCellAtRadius(radius);
      radius += 1;
    }
    return cell;
  }


  public findEmptyCellAtRadius(radius: number): Cell {
    let cell: Cell;
    const coords = [
      this.x + radius, // start to the right of this cell
      this.y
    ];
    // console.log(`findEmptyCellAtRadius(${radius}) initial co-ords ${coords}`);
    if (!cell) {
      cell = this.findEmptyCellInLine(coords, (radius + 1),  0,  1); // downwards
    }
    if (!cell) {
      cell = this.findEmptyCellInLine(coords, (radius + 1), -1,  0); // leftwards
    }
    if (!cell) {
      cell = this.findEmptyCellInLine(coords, (radius + 1),  0, -1); // upwards
    }
    if (!cell) {
      cell = this.findEmptyCellInLine(coords, (radius + 1),  1,  0); // rightwards
    }
    return cell;
  }


  public findEmptyCellInLine(coords: number[], length: number, x_incr: number, y_incr: number): Cell {
    let cell: Cell;
    // console.log(`findEmptyCellInLine(${coords}, ${length}, ${x_incr}, ${y_incr})`);
    for (let i = 0; !cell && (i < length); i += 1) {
      let temp_cell: Cell = this.fixer.getCellAt(coords);
      if (!temp_cell) {
        cell = this.fixer.makeCellAt(coords[0], coords[1]);
      } else if (temp_cell.isEmpty()) {
        cell = temp_cell;
      }
      coords[0] += x_incr;
      coords[1] += y_incr;
    }
    return cell;
  }


  public isEmpty(): boolean {
    return (this.blocks.length === 0);
  }


  public toString(): string {
    return `cell [${this.x}, ${this.y}]`;
  }
}
