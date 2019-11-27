
import Geom from "geom-api";
import Block from "../core/Block";
import Domain from "../core/Domain";
import Connector from "../core/Connector";



type Direction = "H" | "V";


export default class LineSpreader {
  private line_groups: {[key: string]: LineGroup};

  constructor() {
    this.line_groups = {};
  }


  private addLine(line_seg: Geom.LineSegment, line_before?: Geom.LineSegment, line_after?: Geom.LineSegment): void {
    const line: Line = new Line(line_seg, line_before, line_after);
    this.addLineToGroup(line);
  }


  private addLineToGroup(line: Line): void {
    const key: string = line.getDirection() + line.getPosition();
    if (!this.line_groups[key]) {
      this.line_groups[key] = new LineGroup(line.getDirection(), line.getPosition());
    }
    this.line_groups[key].addLine(line);
  }


  public doBlock(block: Block): void {
    block.getConnectors().forEach((connector: Connector) => {
      this.doConnector(connector);
    });
  }


  public doConnector(connector: Connector): void {
    let prev_line_1: Geom.LineSegment = null;
    let prev_line_2: Geom.LineSegment = null;
    const iter = (line: Geom.LineSegment) => {
      if (prev_line_1) {
        this.addLine(prev_line_1, prev_line_2, line);
      }
      prev_line_2 = prev_line_1;
      prev_line_1 = line;
    }
    connector.forEachLineSegment((line: Geom.LineSegment) => {
      iter(line);
    });
    iter(null);
  }


  public layoutDomain(Domain: Domain): void {
    Domain.forEachBlock((block: Block) => {
      this.doBlock(block);
    });
  }

}


class LineGroup {
  private dir: Direction;
  private lines: Line[];
  private pos: number;

  constructor(dir: Direction, pos: number) {
    this.dir = dir;
    this.lines = [];
    this.pos = pos;
  }


  public addLine(line: Line): void {
    this.lines.push(line);
  }


  public doOverlaps(callback: (line_a: Line, line_b: Line) => void): void {
    this.lines.forEach((line_a: Line) => {
      let go: boolean = true;
      this.lines.forEach((line_b: Line) => {
        if (line_a === line_b) {
          go = false;
        }
        if (go) {
          callback(line_a, line_b);
        }
      });
    });
  }
}


class Line {
  private dir: Direction;
  private pos: number;
  private start: number;
  private end  : number;
  private line_seg    : Geom.LineSegment;
  private line_before?: Geom.LineSegment;
  private line_after ?: Geom.LineSegment;

  constructor(line_seg: Geom.LineSegment, line_before: Geom.LineSegment, line_after: Geom.LineSegment) {
    this.line_seg = line_seg;
    this.line_before = line_before;
    this.line_after = line_after;
    if (this.line_seg.getFrom().getX() === this.line_seg.getTo().getX()) {
      this.dir = "V";
      this.pos = this.line_seg.getFrom().getX();
      if (this.line_seg.getFrom().getY() > this.line_seg.getTo().getY()) {
        this.start = this.line_seg.getTo  ().getY();
        this.end   = this.line_seg.getFrom().getY();
      } else {
        this.start = this.line_seg.getFrom().getY();
        this.end   = this.line_seg.getTo  ().getY();
      }
    } else if (this.line_seg.getFrom().getY() === this.line_seg.getTo().getY()) {
      this.dir = "H";
      this.pos = this.line_seg.getFrom().getY();
      if (this.line_seg.getFrom().getX() > this.line_seg.getTo().getX()) {
        this.start = this.line_seg.getTo  ().getX();
        this.end   = this.line_seg.getFrom().getX();
      } else {
        this.start = this.line_seg.getFrom().getX();
        this.end   = this.line_seg.getTo  ().getX();
      }
    } else {
      throw new Error(`line is neither horizontal nor vertical`);
    }
  }


  public getDirection(): Direction {
    return this.dir;
  }


  public getPosition(): number {
    return this.pos;
  }

}
