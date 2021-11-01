import { Area, Point } from "geom-api";
import Block from "../core/Block";
import Domain, { Phase } from "../core/Domain";
import { NonIterativeLayout } from "./ILayout";

/**
 * Layout consists of a mosaic of tiles of two types: solids and spacers
 * Tiles cover the entire area with no overlaps
 * Spacer tiles are organized as maximal horizontal strips
 * i.e. no spacer tile has another spacer to its immediate left or right
 */

export default class CornerStitch implements NonIterativeLayout {
  private all_tiles: Tile[];
  private total_area: Area;
  private first_tile: Tile;

  constructor(bottom_right: Point) {
    this.all_tiles = [];
    this.total_area = new Area(new Point(0, 0), bottom_right);
    this.first_tile = this.addTile(this.total_area);
  }

  public addBlock(area: Area, block: Block): Tile {
    if (this.findSolidTileWithinArea(area)) {
      throw new Error(`area ${area} already contains a solid tile`);
    }
    const block_tile: Tile = this.addTile(area, block);
    const orig_above = this.findTileContaining(area.getTopLeft());
    orig_above.shrinkToFitAbove(this, block_tile);
    const spacer_below = this.findTileContaining(
      area.getBottomRight()
    ).shrinkToFitBelow(this, block_tile);
    let spacer_overlapping_block = this.findTileContaining(area.getTopLeft());
    let above_left = orig_above;
    let above_right = orig_above;
    do {
      above_right = spacer_overlapping_block.splitAroundBlock(
        this,
        block_tile,
        above_left,
        above_right
      );
      above_left = spacer_overlapping_block;
      spacer_overlapping_block = spacer_overlapping_block.getNeighbour("lb");
    } while (
      spacer_overlapping_block &&
      spacer_overlapping_block.getArea().getMaxY() <= area.getMaxY()
    );
    spacer_below.tidyUpBottom(block_tile, above_left, above_right);
    return block_tile;
  }

  // TODO remove
  public addTile(area: Area, block?: Block): Tile {
    const tile: Tile = new Tile(area, block);
    this.all_tiles.push(tile);
    return tile;
  }

  public apply(domain: Domain) {
    domain.checkPhaseAllowed(Phase.BlockLayout);
    domain.forEachBlock((block: Block) => {
      this.addTile(block.getArea(), block);
    });
  }

  public checkStitches(): void {
    this.all_tiles.forEach((tile: Tile) => {
      tile.checkStitches();
    });
  }

  public findSolidTileWithinArea(area: Area): Tile {
    const bottom_left: Point = new Point(area.getMinX(), area.getMaxY());
    return this.findTileContaining(bottom_left).findSolidTileWithinArea(area);
  }

  public findTileContaining(point: Point): Tile {
    const out = this.first_tile.findTileContaining(point);
    console.log(`findTileContaining(${point}) = ${out}`);
    return out;
  }

  public forEachTile(callback: (tile: Tile) => void): void {
    this.all_tiles.forEach(callback);
  }

  public forEachTileInArea(
    top_left: Point,
    bottom_right: Point,
    callback: (tile: Tile) => void
  ): void {
    const bottom_left: Point = new Point(top_left.getX(), bottom_right.getY());
    this.findTileContaining(bottom_left).forEachTileInArea(
      top_left,
      bottom_right,
      callback
    );
  }

  public getArea(): Area {
    return this.total_area;
  }

  public getFirstTile(): Tile {
    return this.first_tile;
  }

  public sweep(callback: (tile: Tile) => void): void {
    this.findTileContaining(new Point(999, 499)).sweep(
      "l",
      Number.POSITIVE_INFINITY,
      callback
    );
  }
}

export class Tile {
  private area: Area;
  private block: Block;
  private tl: Tile; // top of left side pointing left
  private tr: Tile; // top of right side pointing right
  private bl: Tile; // bottom of left side pointing left
  private br: Tile; // bottom of right side pointing right
  private lt: Tile; // left of top side pointing upwards
  private rt: Tile; // right of top side pointing upwards
  private lb: Tile; // left of bottom side pointing downwards
  private rb: Tile; // right of bottom side pointing downwards

  constructor(area: Area, block?: Block) {
    this.area = area;
    this.block = block;
  }

  private checkStitch(locn: string, dir: string, tile?: Tile): void {
    if (!tile) {
      if (dir === "l" && this.area.getMinX() > 0)
        console.log(`ERROR: ${this} missing ${locn}${dir}`);
      if (dir === "r" && this.area.getMaxX() < 999)
        console.log(`ERROR: ${this} missing ${locn}${dir}`);
      if (dir === "t" && this.area.getMinY() > 0)
        console.log(`ERROR: ${this} missing ${locn}${dir}`);
      if (dir === "b" && this.area.getMaxY() < 499)
        console.log(`ERROR: ${this} missing ${locn}${dir}`);
      return;
    }
    if (dir === "l" && this.area.getMinX() - 1 !== tile.area.getMaxX())
      console.log(`ERROR: ${this} ${locn}l not adjacent to ${tile} `);
    if (dir === "r" && this.area.getMaxX() + 1 !== tile.area.getMinX())
      console.log(`ERROR: ${this} ${locn}r not adjacent to ${tile} `);
    if (dir === "t" && this.area.getMinY() - 1 !== tile.area.getMaxY())
      console.log(`ERROR: ${this} ${locn}t not adjacent to ${tile} `);
    if (dir === "b" && this.area.getMaxY() + 1 !== tile.area.getMinY())
      console.log(`ERROR: ${this} ${locn}b not adjacent to ${tile} `);
    if (
      locn === "l" &&
      (tile.area.getMinX() > this.area.getMinX() ||
        tile.area.getMaxX() < this.area.getMinX())
    )
      console.log(`ERROR: ${this} l${dir} not aligned to ${tile} `);
    if (
      locn === "r" &&
      (tile.area.getMinX() > this.area.getMaxX() ||
        tile.area.getMaxX() < this.area.getMaxX())
    )
      console.log(`ERROR: ${this} r${dir} not aligned to ${tile} `);
    if (
      locn === "t" &&
      (tile.area.getMinY() > this.area.getMinY() ||
        tile.area.getMaxY() < this.area.getMinY())
    )
      console.log(`ERROR: ${this} t${dir} not aligned to ${tile} `);
    if (
      locn === "b" &&
      (tile.area.getMinY() > this.area.getMaxY() ||
        tile.area.getMaxY() < this.area.getMaxY())
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

  public findSolidTileWithinArea(area: Area): Tile {
    if (this.isSolid()) {
      return this;
    }
    if (this.area.getMaxX() < area.getMaxX() && this.br && this.br.isSolid()) {
      return this.br;
    }
    if (this.area.getMinY() > area.getMinY()) {
      return this.lt.findSolidTileWithinArea(area);
    }
    return null;
  }

  public findTileContaining(point: Point): Tile {
    if (point.getY() < this.area.getMinY()) {
      return this.lt && this.lt.findTileContaining(point);
    } else if (point.getY() > this.area.getMaxY()) {
      return this.lb && this.lb.findTileContaining(point);
    } else if (point.getX() < this.area.getMinX()) {
      return this.bl && this.bl.findTileContaining(point);
    } else if (point.getX() > this.area.getMaxX()) {
      return this.br && this.br.findTileContaining(point);
    } else {
      return this;
    }
  }

  public forEachNeighbour(callback: (tile: Tile) => void): void {
    this.forEachNeighbourAlongSide(this.tr, this.br, "lb", callback); // right side
    this.forEachNeighbourAlongSide(this.rb, this.lb, "tl", callback); // bottom side
    this.forEachNeighbourAlongSide(this.bl, this.tl, "rt", callback); // left side
    this.forEachNeighbourAlongSide(this.lt, this.rt, "br", callback); // top side
  }

  public forEachNeighbourAlongSide(
    start: Tile,
    end: Tile,
    dir: string,
    callback: (tile: Tile) => void
  ): void {
    let neighbour: Tile = start;
    while (neighbour) {
      callback(neighbour);
      if (neighbour === end) {
        neighbour = null;
      } else {
        neighbour = neighbour[dir];
      }
    }
  }

  public forEachTileInArea(
    top_left: Point,
    bottom_right: Point,
    callback: (tile: Tile) => void
  ): void {
    if (this.isSolid()) {
    } else {
    }
  }

  public forEachConnector(callback: (connector: any) => void) {
    return;
  }

  public getArea(): Area {
    return this.area;
  }

  public getBlock(): Block {
    return this.block;
  }

  public getCentre(): Point {
    return new Point(
      (this.area.getMinX() + this.area.getMaxX()) / 2,
      (this.area.getMinY() + this.area.getMaxY()) / 2
    );
  }

  public getId(): string {
    return this.block?.getId() || `spacer_${this.area}`;
  }

  public getLink(): string {
    return this.block?.getLink();
  }

  public getName(): string {
    return this.toString();
  }

  public getNeighbour(ref: string): Tile {
    return this[ref];
  }

  public isSolid(): boolean {
    return !!this.block;
  }

  public setArea(area: Area): void {
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

  public setHeight(height: number) {} // ignore

  public shrinkToFitAbove(cs: CornerStitch, block_tile: Tile): Tile {
    const orig_area = this.area;
    this.area = new Area(
      this.area.getTopLeft(),
      new Point(this.area.getMaxX(), block_tile.area.getMinY() - 1)
    );
    const new_spacer = cs.addTile(
      new Area(
        new Point(orig_area.getMinX(), block_tile.area.getMinY()),
        orig_area.getBottomRight()
      )
    );
    this.lb = new_spacer;
    this.rb = new_spacer;
    new_spacer.lt = this;
    new_spacer.rt = this;
    return new_spacer;
  }

  public shrinkToFitBelow(cs: CornerStitch, block_tile: Tile): Tile {
    const orig_area = this.area;
    this.area = new Area(
      this.area.getTopLeft(),
      new Point(this.area.getMaxX(), block_tile.area.getMaxY())
    );
    const new_spacer = cs.addTile(
      new Area(
        new Point(orig_area.getMinX(), block_tile.area.getMaxY() + 1),
        orig_area.getBottomRight()
      )
    );
    this.lb = new_spacer;
    this.rb = new_spacer;
    new_spacer.lt = this;
    new_spacer.rt = this;
    return new_spacer;
  }

  public splitAroundBlock(
    cs: CornerStitch,
    block_tile: Tile,
    above_left: Tile,
    above_right: Tile
  ): Tile {
    const orig_area = this.area;
    this.area = new Area(
      this.area.getTopLeft(),
      new Point(block_tile.area.getMinX() - 1, this.area.getMaxY())
    );
    const new_spacer = cs.addTile(
      new Area(
        new Point(block_tile.area.getMaxX() + 1, orig_area.getMinY()),
        orig_area.getBottomRight()
      )
    );
    this.tr = block_tile;
    this.br = block_tile;
    new_spacer.tl = block_tile;
    new_spacer.bl = block_tile;
    this.rt = above_left;
    new_spacer.lt = above_right;
    new_spacer.rt = above_right; // TODO might be different
    if (above_left === above_right) {
      block_tile.lt = above_left;
      block_tile.rt = above_left;
      block_tile.tl = this;
      block_tile.tr = new_spacer;
    } else {
      above_left.rb = this;
      above_right.lb = new_spacer;
    }
    above_left.lb = this; // TODO might be a different tile
    above_right.rb = new_spacer; // TODO might be different
    return new_spacer;
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
        y_level = Math.min(y_level, this.area.getMaxY());
        dir = dir === "r" ? "l" : "r"; // swap direction
        console.log(`  turning... ${i} ${next_tile} ${y_level} ${dir}`);
      }
      next_tile.sweep(dir, y_level, callback);
    }
  }

  public tidyUpBottom(block_tile: Tile, above_left: Tile, above_right: Tile) {
    this.rt = above_right;
    above_right.rb = this;
    above_left.rb = this;
    above_right.lb = this;
    block_tile.lb = this;
    block_tile.rb = this;
    block_tile.bl = above_left;
    block_tile.br = above_right;
  }

  public toString(): string {
    return `{${this.area} / ${this.block || "spacer"}}`;
  }
}
