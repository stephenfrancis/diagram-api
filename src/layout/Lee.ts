
import * as Geom from "geom-api";
import Block from "../core/Block";
import Connector from "../core/Connector";
import Domain from "../core/Domain";
import ILayout from "./ILayout";


const pad = function (str, num) {
  return (" ").repeat(Math.max(num - str.length, 0)) + str;
}

export default class Lee implements ILayout {
  private cells: Cell[][];
  private max_x: number;
  private max_y: number;
  private min_x: number;
  private min_y: number;

  constructor() {
    this.clear();
  }


  public addBlock(block: Block): void {
    const cell: Cell = this.makeCellAt(block.getCentre());
    cell.addBlock(block);
  }


  public beginDomain(Domain: Domain): void {
    console.log(`Lee.beginDomain()`);
    this.clear();
    Domain.forEachBlock((block: Block) => {
      this.addBlock(block);
    });
    Domain.forEachBlock((block: Block) => {
      this.doBlock(block);
    });
  }


  private checkInteger(arg: number): void {
    if (!Number.isInteger(arg)) {
      throw new Error(`must be an integer: ${arg}`);
    }
  }

  public clear(): void {
    this.cells = [];
    this.max_x = Number.NEGATIVE_INFINITY;
    this.max_y = Number.NEGATIVE_INFINITY;
    this.min_x = Number.POSITIVE_INFINITY;
    this.min_y = Number.POSITIVE_INFINITY;
  }


  private doBlock(block: Block): void {
    // const report: boolean = (block.getName().indexOf("Now THIS Is My Kind") === 0);
    block.getConnectors().forEach((connector: Connector) => {
      this.doConnector(connector, false);
    });
  }


  private doConnector(connector: Connector, report: boolean): void {
    const from_dir: Geom.Direction = connector.getFromDirection();

    const fr_c: Geom.Point = connector.getFrom().getCentre();
    const fr_p: Geom.Point = fr_c.add(from_dir.getDeltaUnit());
    connector.addLineSegment(new Geom.LineSegment(fr_c, fr_p));

    const to_dir: Geom.Direction = connector.getToDirection();
    const to_c: Geom.Point = connector.getTo()  .getCentre();
    const to_p: Geom.Point = to_c.add(  to_dir.getDeltaUnit());

    this.resetScores();
    const lines: Geom.LineSegment[] = this.makeCellAt(fr_p).workOut(this,
      this.makeCellAt(to_p), connector.getToDirection().toString().charAt(0), report);

    lines.reverse().forEach((line: Geom.LineSegment) => {
      connector.addLineSegment(line);
    });

    connector.addLineSegment(new Geom.LineSegment(to_p, to_c));

    // let prev_point: Geom.Point = null;
    // corner_points.reverse().forEach((point: Geom.Point) => {
    //   if (prev_point) {
    //     connector.addLineSegment(new Geom.LineSegment(prev_point, point));
    //   }
    //   prev_point = point;
    // });
    if (report) {
      this.output();
      // console.log(`From ${connector.getFrom()} to ${connector.getTo()}: ${JSON.stringify(corner_points)}`);
    }
  }


  public getMaxRadius(): number {
    return Math.ceil(this.max_x - this.min_x + this.max_y - this.min_y + 2);
  }


  public iterate(): boolean {
    return false;
  }


  public loopOverCellsX(callback: (Cell) => void): void {
    for (let x = this.min_x; x <= this.max_x; x += 1) {
      if (this.cells[x]) {
        this.loopOverCellsY(x, callback);
      }
    }
  }


  public loopOverCellsY(x: number, callback: (Cell) => void): void {
    for (let y = this.min_y; y <= this.max_y; y += 1) {
      if (this.cells[x][y]) {
        callback(this.cells[x][y]);
      }
    }
  }


  public makeCellAt(point: Geom.Point): Cell {
    const x: number = point.getX();
    const y: number = point.getY();
    this.checkInteger(x);
    this.checkInteger(y);
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
      this.cells[x][y] = new Cell(point);
    }
    return this.cells[x][y];
  }


  public makeCellAtWithinBounds(point: Geom.Point): Cell {
    const x: number = point.getX();
    const y: number = point.getY();
    this.checkInteger(x);
    this.checkInteger(y);
    if (x < this.min_x || x > this.max_x || y < this.min_y || y > this.max_y) {
      return null;
    }
    return this.makeCellAt(point);
  }


  public output(what?: string): void {
    what = what || "score";
    let header: string = "       ";
    const lines: string[] = [];
    for (let y = this.min_y; y <= this.max_y; y += 1) {
      lines[y] = pad(y.toFixed(0), 5) + ": ";
    }
    for (let x = this.min_x; x <= this.max_x; x += 1) {
      header += pad(x.toFixed(0), 3);
      this.cells[x] = this.cells[x] || [];
      for (let y = this.min_y; y <= this.max_y; y += 1) {
        if (this.cells[x][y]) {
          const score: number = this.cells[x][y].getVal(what);
          if (score !== null) {
            lines[y] += pad(score.toFixed(0), 3);
          } else if (this.cells[x][y].getBlock()) {
            lines[y] += " []";
          } else {
            lines[y] += " - ";
          }
        } else {
          lines[y] +=  " . ";
        }
      }
    }
    console.log(header);
    for (let y = this.min_y; y <= this.max_y; y += 1) {
      console.log(lines[y]);
    }
  }


  public resetScores(): void {
    this.loopOverCellsX((cell: Cell) => {
      cell.resetScore();
    });
  }


  public toString(): string {
    return `[${this.min_x}, ${this.min_y}] / [${this.max_x}, ${this.max_y}]`;
  }

}


const delta = {
  N: { p: new Geom.Point( 0, -1), x:  0, y: -1, left: "W", right: "E", },
  E: { p: new Geom.Point( 1,  0), x:  1, y:  0, left: "N", right: "S", },
  S: { p: new Geom.Point( 0,  1), x:  0, y:  1, left: "E", right: "W", },
  W: { p: new Geom.Point(-1,  0), x: -1, y:  0, left: "S", right: "N", },
}

class Cell {
  private block: Block;
  private lines_horiz: number;
  private lines_vert : number;
  private point: Geom.Point;
  private score: number;

  constructor(point: Geom.Point) {
    this.block = null;
    this.score = null;
    this.lines_horiz = 0;
    this.lines_vert  = 0;
    this.point = point;
  }


  public addBlock(block: Block): void {
    if (this.block) {
      throw new Error(`only one block allowed per cell`);
    }
    this.block = block;
  }


  public getBlock(): Block {
    return this.block;
  }


  public getVal(what: string): number {
    return this[what];
  }


  public getScore(): number {
    return this.score;
  }


  public resetScore(): void {
    this.score = null;
  }


  public toString(): string {
    return `${this.point} - ${this.score || this.block || "[space]"}`;
  }


  public workBack(lee: Lee, proc: any): Cell {
    // console.log(`workBack() ${this}`);
    let score: number = Number.POSITIVE_INFINITY;
    let best_neigbour: Cell = null;
    let new_dir: string = null;

    if (proc.dir === "N" || proc.dir === "S") {
      this.lines_vert += 1;
    } else {
      this.lines_horiz += 1;
    }

    const checkNeighbour = (dir: string) => {
      const cell: Cell = lee.makeCellAtWithinBounds(this.point.add(delta[dir].p));
      if (!cell) {
        return;
      }
      let cell_score = cell.getScore();
      if (Number.isFinite(cell_score) && cell_score < score) {
        score = cell_score;
        best_neigbour = cell;
        new_dir = dir;
      }
    }

    checkNeighbour(proc.dir);
    checkNeighbour(delta[proc.dir].left);
    checkNeighbour(delta[proc.dir].right);
    if (!best_neigbour) {
      lee.output();
      throw new Error(`workBack() failed at ${this.point}`);
    }
    if (proc.dir !== new_dir) {
      proc.lines.push(new Geom.LineSegment(this.point, proc.prev_corner));
      proc.prev_corner = this.point;
    }
    proc.dir = new_dir;
    return best_neigbour;
  }


  public workOut(lee: Lee, target: Cell, to_dir: string, report: boolean): Geom.LineSegment[] {
    console.log(`workOut() ${this} ${target} ${this.score} ${this.block}, ${lee.getMaxRadius()}`);
    this.score = 0;
    this.workOutCellAtPosition(lee);
    for (let i: number = 1; i < lee.getMaxRadius(); i += 1) {
      this.workOutAtRadius(lee, i);
    }
    const proc: any = {
      counter: 0,
      dir: to_dir,
      lines: [],
      prev_corner: target.point,
    };
    let next_cell: Cell = target;
    while (next_cell !== this && proc.counter < 100) {
      next_cell = next_cell.workBack(lee, proc);
      proc.counter += 1;
    }
    proc.lines.push(new Geom.LineSegment(this.point, proc.prev_corner));
    // console.log(`line segments: ${JSON.stringify(corner_points)} ${proc.counter}`);
    return proc.lines;
  }


  public workOutAtRadius(lee: Lee, radius: number): void {
    // console.log(`workOutAtRadius() ${this.x}, ${this.y} radius: ${radius}`);
    let x: number = this.point.getX() - radius;
    let y: number = this.point.getY();
    while (x < this.point.getX()) {
      // console.log(`workOutAtRadius() NE ${x} <= ${this.x}, ${y} ${this.y}`);
      this.workOutCell(lee, x, y);
      x += 1;
      y -= 1;
    }
    while (y < this.point.getY()) {
      // console.log(`workOutAtRadius() SE ${x} ${this.x}, ${y} <= ${this.y}`);
      this.workOutCell(lee, x, y);
      x += 1;
      y += 1;
    }
    while (x > this.point.getX()) {
      this.workOutCell(lee, x, y);
      x -= 1;
      y += 1;
    }
    while (y > this.point.getY()) {
      this.workOutCell(lee, x, y);
      x -= 1;
      y -= 1;
    }
  }


  public workOutCell(lee: Lee, x: number, y: number): void {
    const cell: Cell = lee.makeCellAtWithinBounds(new Geom.Point(x, y));
    // console.log(`workOutCell() [${x}, ${y}] ${cell}`);
    if (cell && !cell.block && typeof cell.score === "number") {
      cell.workOutCellAtPosition(lee);
    }
  }


  private workOutCellAtPosition(lee) {
    const doNeighbour = (dir: string) => {
      const cell: Cell = lee.makeCellAtWithinBounds(this.point.add(delta[dir].p));
      if (cell && cell.score === null && !cell.block) {
        cell.score = this.score + 1;
      }
    }
    doNeighbour("N");
    doNeighbour("E");
    doNeighbour("S");
    doNeighbour("W");
  }

}
