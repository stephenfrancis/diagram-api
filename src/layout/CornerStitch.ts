import * as Geom from "geom-api";
import Block from "../core/Block";

export default class CornerStitch {
  private all_tiles: Tile[];
  private total_area: Geom.Area;
  private first_tile: Tile;

  constructor(bottom_right: Geom.Point) {
    this.all_tiles = [];
    this.total_area = new Geom.Area(new Geom.Point(0, 0), bottom_right);
    this.first_tile = this.addTile(this.total_area);
  }

  public addTile(area: Geom.Area, block?: Block): Tile {
    const tile: Tile = new Tile(area, block);
    this.all_tiles.push(tile);
    return tile;
  }

  public checkStitches(): void {
    this.all_tiles.forEach((tile: Tile) => {
      tile.checkStitches();
    });
  }

  public doesAreaContainBlock(
    top_left: Geom.Point,
    bottom_right: Geom.Point
  ): boolean {
    const bottom_left: Geom.Point = new Geom.Point(
      top_left.getX(),
      bottom_right.getY()
    );
    return this.findTileContaining(bottom_left).doesAreaContainBlock(
      top_left,
      bottom_right
    );
  }

  public findTileContaining(point: Geom.Point): Tile {
    return this.first_tile.findTileContaining(point);
  }

  public forEachTile(callback: (tile: Tile) => void): void {
    this.all_tiles.forEach(callback);
  }

  public forEachTileInArea(
    top_left: Geom.Point,
    bottom_right: Geom.Point,
    callback: (tile: Tile) => void
  ): void {
    const bottom_left: Geom.Point = new Geom.Point(
      top_left.getX(),
      bottom_right.getY()
    );
    this.findTileContaining(bottom_left).forEachTileInArea(
      top_left,
      bottom_right,
      callback
    );
  }

  public getArea(): Geom.Area {
    return this.total_area;
  }

  public getFirstTile(): Tile {
    return this.first_tile;
  }

  public sweep(callback: (tile: Tile) => void): void {
    this.findTileContaining(new Geom.Point(999, 499)).sweep(
      "l",
      Number.POSITIVE_INFINITY,
      callback
    );
  }
}

export class Tile {
  private area: Geom.Area;
  private block: Block;
  private tl: Tile;
  private tr: Tile;
  private bl: Tile;
  private br: Tile;
  private lt: Tile;
  private rt: Tile;
  private lb: Tile;
  private rb: Tile;

  constructor(area: Geom.Area, block?: Block) {
    this.area = area;
    this.block = block;
  }

  private checkStitch(locn: string, dir: string, tile?: Tile): void {
    if (!tile) {
      if (dir === "l" && this.getMinX() > 0)
        console.log(`ERROR: ${this} missing ${locn}${dir}`);
      if (dir === "r" && this.getMaxX() < 999)
        console.log(`ERROR: ${this} missing ${locn}${dir}`);
      if (dir === "t" && this.getMinY() > 0)
        console.log(`ERROR: ${this} missing ${locn}${dir}`);
      if (dir === "b" && this.getMaxY() < 499)
        console.log(`ERROR: ${this} missing ${locn}${dir}`);
      return;
    }
    if (dir === "l" && this.getMinX() - 1 !== tile.getMaxX())
      console.log(`ERROR: ${this} ${locn}l not adjacent to ${tile} `);
    if (dir === "r" && this.getMaxX() + 1 !== tile.getMinX())
      console.log(`ERROR: ${this} ${locn}r not adjacent to ${tile} `);
    if (dir === "t" && this.getMinY() - 1 !== tile.getMaxY())
      console.log(`ERROR: ${this} ${locn}t not adjacent to ${tile} `);
    if (dir === "b" && this.getMaxY() + 1 !== tile.getMinY())
      console.log(`ERROR: ${this} ${locn}b not adjacent to ${tile} `);
    if (
      locn === "l" &&
      (tile.getMinX() > this.getMinX() || tile.getMaxX() < this.getMinX())
    )
      console.log(`ERROR: ${this} l${dir} not aligned to ${tile} `);
    if (
      locn === "r" &&
      (tile.getMinX() > this.getMaxX() || tile.getMaxX() < this.getMaxX())
    )
      console.log(`ERROR: ${this} r${dir} not aligned to ${tile} `);
    if (
      locn === "t" &&
      (tile.getMinY() > this.getMinY() || tile.getMaxY() < this.getMinY())
    )
      console.log(`ERROR: ${this} t${dir} not aligned to ${tile} `);
    if (
      locn === "b" &&
      (tile.getMinY() > this.getMaxY() || tile.getMaxY() < this.getMaxY())
    )
      console.log(`ERROR: ${this} b${dir} not aligned to ${tile} `);
  }

  public checkStitches(): void {
    console.log(`checking stitches for tile ${this}`);
    this.checkStitch("b", "l", this.bl);
    this.checkStitch("b", "r", this.br);
    this.checkStitch("r", "t", this.rt);
    this.checkStitch("r", "b", this.rb);
    this.checkStitch("t", "l", this.tl);
    this.checkStitch("t", "r", this.tr);
    this.checkStitch("l", "t", this.lt);
    this.checkStitch("l", "b", this.lb);
  }

  public doesAreaContainBlock(
    top_left: Geom.Point,
    bottom_right: Geom.Point
  ): boolean {
    if (this.block) {
      return true;
    } else if (top_left.getY() < this.getMinY()) {
      return false;
    } else if (
      this.tr &&
      this.tr.getMinX() < bottom_right.getX() &&
      this.tr.block
    ) {
      return true;
    } else if (this.lt && this.lt.getMaxY() > top_left.getY()) {
      return this.lt.doesAreaContainBlock(top_left, bottom_right);
    } else {
      return false;
    }
  }

  public forEachNeighbour(callback: (tile: Tile) => {}): void {
    this.forEachNeighbourAlongSide(this.tr, this.br, "lb", callback); // right side
    this.forEachNeighbourAlongSide(this.rb, this.lb, "tl", callback); // bottom side
    this.forEachNeighbourAlongSide(this.bl, this.tl, "rt", callback); // left side
    this.forEachNeighbourAlongSide(this.lt, this.rt, "br", callback); // top side
  }

  private forEachNeighbourAlongSide(
    start: Tile,
    end: Tile,
    dir: string,
    callback: (tile: Tile) => void
  ): void {
    let neighbour: Tile = start;
    do {
      callback(neighbour);
      neighbour = neighbour[dir];
    } while (neighbour !== end);
  }

  public forEachTileInArea(
    top_left: Geom.Point,
    bottom_right: Geom.Point,
    callback: (tile: Tile) => void
  ): void {
    callback(this);
  }

  public findTileContaining(point: Geom.Point): Tile {
    if (point.getY() < this.area.getTopLeft().getY()) {
      return this.lt && this.lt.findTileContaining(point);
    } else if (point.getY() > this.area.getBottomRight().getY()) {
      return this.lb && this.lb.findTileContaining(point);
    } else if (point.getX() < this.area.getTopLeft().getX()) {
      return this.bl && this.bl.findTileContaining(point);
    } else if (point.getX() > this.area.getBottomRight().getX()) {
      return this.br && this.br.findTileContaining(point);
    } else {
      return this;
    }
  }

  public getArea(): Geom.Area {
    return this.area;
  }

  public getBlock(): Block {
    return this.block;
  }

  public getMaxX(): number {
    return this.area.getBottomRight().getX();
  }

  public getMaxY(): number {
    return this.area.getBottomRight().getY();
  }

  public getMinX(): number {
    return this.area.getTopLeft().getX();
  }

  public getMinY(): number {
    return this.area.getTopLeft().getY();
  }

  public setArea(area: Geom.Area): void {
    this.area = area;
  }

  public setAllCornerTiles(
    lt?: Tile,
    rt?: Tile,
    tr?: Tile,
    br?: Tile,
    rb?: Tile,
    lb?: Tile,
    bl?: Tile,
    tl?: Tile
  ) {
    this.lt = lt;
    this.rt = rt;
    this.tr = tr;
    this.br = br;
    this.rb = rb;
    this.lb = lb;
    this.bl = bl;
    this.tl = tl;
  }

  public setCornerTileRef(ref: string, tile: Tile): void {
    if (!/^[tbrl]{2}$/.exec(ref)) {
      throw new Error(`invalid corner tile ref: ${ref}`);
    }
    this[ref] = tile;
  }

  public sweep(
    dir: string,
    y_level: number,
    callback: (tile: Tile) => void
  ): void {
    callback(this);
    const check_seq = {
      r: ["lb", "rb", "br", "tr", "rt"],
      l: ["rb", "lb", "bl", "tl", "lt"],
    };
    let next_tile: Tile = null;
    let i = 0;
    while (!next_tile && i < check_seq[dir].length) {
      let ith_tile = this[check_seq[dir][i]];
      if (ith_tile) {
        // console.log(`  testing ${dir} ${i} ${check_seq[dir][i]} --> ${ith_tile} ${ith_tile.getMaxY()}`)
        if (ith_tile.getMaxY() < y_level) {
          next_tile = ith_tile;
        }
      }
      i += 1;
    }
    if (next_tile) {
      if (i === 5) {
        y_level = Math.min(y_level, this.getMaxY());
        dir = dir === "r" ? "l" : "r"; // swap direction
        console.log(`  turning... ${i} ${next_tile} ${y_level} ${dir}`);
      }
      next_tile.sweep(dir, y_level, callback);
    }
  }

  public toString(): string {
    return `{${this.area} / ${this.block || "spacer"}}`;
  }
}
