
import * as Geom from "geom-api";
import Block from "../core/Block";
import Domain from "../core/Domain";
import ILayout from "./ILayout";


interface Profile {
  margin_left: number;
  margin_top: number;
  height: number | "block";
  id: string;
  inter_block_padding_x: number;
  inter_block_padding_y: number;
  width: number | "block";
}

const profiles: {[index:string]: Profile} = {
  svg: {
    margin_left: 15, // allow for connector paths
    margin_top: 15, // allow for connector paths
    height: "block",
    id: "svg",
    inter_block_padding_x: 30,
    inter_block_padding_y: 30,
    width: "block",
  },
  cell: {
    margin_left: 0,
    margin_top: 0,
    height: 1,
    id: "cell",
    inter_block_padding_x: 0,
    inter_block_padding_y: 0,
    width: 1,
  },
  double_cell: {
    margin_left: 0,
    margin_top: 0,
    height: 1,
    id: "double_cell",
    inter_block_padding_x: 1,
    inter_block_padding_y: 1,
    width: 1,
  },
  triple_cell: {
    margin_left: 1,
    margin_top: 1,
    height: 1,
    id: "triple_cell",
    inter_block_padding_x: 2,
    inter_block_padding_y: 2,
    width: 1,
  }
}

export default class Scale implements ILayout {
  private columns: Column[];
  private rows: Row[];
  private max_col: number;
  private max_row: number;
  private min_col: number;
  private min_row: number;
  private profile: any;

  constructor(profile: string) {
    this.columns = [];
    this.rows = [];
    this.max_row = Number.NEGATIVE_INFINITY;
    this.max_col = Number.NEGATIVE_INFINITY;
    this.min_row = Number.POSITIVE_INFINITY;
    this.min_col = Number.POSITIVE_INFINITY;
    this.setProfile(profile);
  }


  private addBlock(block: Block): void {
    const x: number = block.getCentre().getX();
    const y: number = block.getCentre().getY();
    // console.log(`Scale.addBlock() adding ${block} to Col ${x} and Row ${y}`);
    this.getRow(y)   .addBlock(block);
    this.getColumn(x).addBlock(block);
  }


  public addConnectors(block: Block): void {
    block.getConnectors().forEach(connector => {
      connector.forEachLineSegment((line: Geom.LineSegment) => {
        this.addLineTerm(line, line.getFrom(), "from");
        this.addLineTerm(line, line.getTo()  , "to");
      });
    });
  }


  public addLineTerm(line: Geom.LineSegment, point: Geom.Point, which: "from" | "to"): void {
    this.getRow   (point.getY()).addLineTerm(line, which);
    this.getColumn(point.getX()).addLineTerm(line, which);
  }


  public beginDomain(domain: Domain): void {
    domain.forEachBlock((block: Block) => {
      this.addBlock(block);
      this.addConnectors(block);
    });
  }


  private getColumn(x: number): Column {
    if (x < this.min_col) {
      this.min_col = x;
    }
    if (x > this.max_col) {
      this.max_col = x;
    }
    if (!this.columns[x]) {
      this.columns[x] = new Column(x);
    }
    return this.columns[x];
  }


  public getProfile(): any {
    return this.profile;
  }


  private getRow(y: number): Row {
    if (y < this.min_row) {
      this.min_row = y;
    }
    if (y > this.max_row) {
      this.max_row = y;
    }
    if (!this.rows[y]) {
      this.rows[y] = new Row(y);
    }
    return this.rows[y];
  }


  public iterate(): boolean {
    this.rescaleColumns();
    this.rescaleRows();
    return false;
  }


  private rescaleColumns(): void {
    let new_x: number = this.profile.margin_left;
    for (let i = this.min_col; i <= this.max_col; i += 1) {
      if (this.columns[i]) {
        new_x += this.columns[i].rescale(new_x, this.profile.width)
          + this.profile.inter_block_padding_x;
      }
    }
  }


  private rescaleRows(): void {
    let new_y: number = this.profile.margin_top;
    for (let i = this.min_row; i <= this.max_row; i += 1) {
      if (this.rows[i]) {
        new_y += this.rows[i].rescale(new_y, this.profile.height)
          + this.profile.inter_block_padding_y;
      }
    }
  }


  public setProfile(profile_id: string): void {
    this.profile = profiles[profile_id];
    if (!this.profile) {
      throw new Error(`unrecognized profile: ${profile_id}`);
    }
  }

}


export class Column {
  private blocks: Block[];
  private lines_from: Geom.LineSegment[];
  private lines_to  : Geom.LineSegment[];
  private max_width: number;
  private x: number;

  constructor(x: number) {
    this.x = x;
    this.max_width = 0;
    this.blocks = [];
    this.lines_from = [];
    this.lines_to   = [];
  }

  public addBlock(block: Block): void {
    this.blocks.push(block);
    if (block.getWidth() > this.max_width) {
      this.max_width = block.getWidth();
    }
  }


  public addLineTerm(line: Geom.LineSegment, which: "from" | "to"): void {
    this["lines_" + which].push(line);
  }


  public getMaxWidth(): number {
    return this.max_width;
  }


  public rescale(new_x: number, by: number | "block"): number {
    const old_x: number = this.x;
    if (by === "block") {
      by = this.max_width;
    }
    this.x = new_x + Math.floor(by / 2);
    // console.log(`Column.rescale() ${old_x} to ${this.x}`);
    this.blocks.forEach((block: Block) => {
      block.setCentre(new Geom.Point(this.x, block.getCentre().getY()));
    });
    this.lines_from.forEach((line: Geom.LineSegment) => {
      line.setFrom(new Geom.Point(this.x, line.getFrom().getY()))
    });
    this.lines_to  .forEach((line: Geom.LineSegment) => {
      line.setTo  (new Geom.Point(this.x, line.getTo  ().getY()))
    });
    return by;
  }

}


export class Row {
  private blocks: Block[];
  private lines_from: Geom.LineSegment[];
  private lines_to  : Geom.LineSegment[];
  private max_height: number;
  private y: number;

  constructor(y: number) {
    this.y = y;
    this.max_height = 0;
    this.blocks = [];
    this.lines_from = [];
    this.lines_to   = [];
  }


  public addBlock(block: Block): void {
    this.blocks.push(block);
    if (block.getHeight() > this.max_height) {
      this.max_height = block.getHeight();
    }
  }


  public addLineTerm(line: Geom.LineSegment, which: "from" | "to"): void {
    this["lines_" + which].push(line);
  }


  public getMaxHeight(): number {
    return this.max_height;
  }


  public rescale(new_y: number, by: number | "block"): number {
    const old_y: number = this.y;
    if (by === "block") {
      by = this.max_height;
    }
    this.y = new_y + Math.floor(by / 2);
    // console.log(`Row.rescale() ${old_y} to ${this.y}`);
    this.blocks.forEach((block: Block) => {
      block.setCentre(new Geom.Point(block.getCentre().getX(), this.y));
    });
    this.lines_from.forEach((line: Geom.LineSegment) => {
      line.setFrom(new Geom.Point(line.getFrom().getX(), this.y))
    });
    this.lines_to  .forEach((line: Geom.LineSegment) => {
      line.setTo  (new Geom.Point(line.getTo  ().getX(), this.y))
    });
    return by;
  }

}
