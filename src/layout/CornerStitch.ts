import { Area, Point } from "geom-api";
import Block from "../core/Block";
import Domain, { Phase } from "../core/Domain";
import { NonIterativeLayout } from "./ILayout";

type Side = "t" | "r" | "b" | "l";
type Ref = "tr" | "tl" | "rt" | "rb" | "br" | "bl" | "lb" | "lt";

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
    const solid_tile = this.findSolidTileWithinArea(area);
    if (solid_tile) {
      throw new Error(
        `area ${area} already contains a solid tile: ${solid_tile}`
      );
    }
    const block_tile: Tile = this.addTile(area, block);
    const orig_above = this.findTileContaining(area.getTopLeft());
    if (
      orig_above &&
      orig_above.getArea().getMinY() < area.getMinY() &&
      area.getMinY() > this.total_area.getMinY()
    ) {
      orig_above.shrinkToFitAbove(this, block_tile);
    }
    const orig_below = this.findTileContaining(area.getBottomRight());
    let spacer_below;
    if (
      orig_below &&
      orig_below.getArea().getMaxY() > area.getMaxY() &&
      area.getMaxY() < this.total_area.getMaxY()
    ) {
      spacer_below = orig_below.shrinkToFitBelow(this, block_tile);
    }
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
      spacer_overlapping_block = spacer_overlapping_block.getStitch("lb");
      // console.log(
      //   ` addBlock iter ${above_left} -> ${spacer_overlapping_block}`
      // );
    } while (
      spacer_overlapping_block &&
      spacer_overlapping_block.getArea().getMaxY() <= area.getMaxY()
    );
    if (spacer_below) {
      spacer_below.tidyUpBottom(block_tile, above_left, above_right);
    }
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

  public checkStitches(): string[] {
    const collector: string[] = [];
    this.all_tiles.forEach((tile: Tile) => {
      tile.checkStitches(this.total_area, collector);
    });
    return collector;
  }

  public findSolidTileWithinArea(area: Area): Tile {
    return this.findTileContaining(
      area.getBottomLeft()
    ).findSolidTileWithinArea(area);
  }

  public findTileContaining(point: Point): Tile {
    const out = this.first_tile.findTileContaining(point);
    // console.log(`findTileContaining(${point}) = ${out}`);
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

  public removeTile(tile: Tile): void {
    const i = this.all_tiles.indexOf(tile);
    if (i === -1) {
      throw new Error(`tile not found: ${tile}`);
    }
    this.all_tiles.splice(i, 1);
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

  public adjustNeighbourStitches(new_tile: Tile): void {
    const all_neighbours = [];
    this.forEachNeighbour((neighbour) => all_neighbours.push(neighbour));
    all_neighbours.forEach((neighbour) =>
      new_tile.updateMutualStitches(neighbour)
    );
  }

  private checkStitch(
    total_area: Area,
    collector: string[],
    locn: Side,
    dir: Side
  ): void {
    const tile: Tile = this[`${locn}${dir}`];
    if (!tile) {
      if (dir === "l" && this.area.getMinX() > total_area.getMinX())
        collector.push(`${this} missing ${locn}${dir}`);
      if (dir === "r" && this.area.getMaxX() < total_area.getMaxX())
        collector.push(`${this} missing ${locn}${dir}`);
      if (dir === "t" && this.area.getMinY() > total_area.getMinY())
        collector.push(`${this} missing ${locn}${dir}`);
      if (dir === "b" && this.area.getMaxY() < total_area.getMaxY())
        collector.push(`${this} missing ${locn}${dir}`);
      return;
    }
    if (dir === "l" && this.area.getMinX() - 1 !== tile.area.getMaxX())
      collector.push(`${this} ${locn}l not adjacent to ${tile} `);
    if (dir === "r" && this.area.getMaxX() + 1 !== tile.area.getMinX())
      collector.push(`${this} ${locn}r not adjacent to ${tile} `);
    if (dir === "t" && this.area.getMinY() - 1 !== tile.area.getMaxY())
      collector.push(`${this} ${locn}t not adjacent to ${tile} `);
    if (dir === "b" && this.area.getMaxY() + 1 !== tile.area.getMinY())
      collector.push(`${this} ${locn}b not adjacent to ${tile} `);
    if (
      locn === "l" &&
      (tile.area.getMinX() > this.area.getMinX() ||
        tile.area.getMaxX() < this.area.getMinX())
    )
      collector.push(`${this} l${dir} not aligned to ${tile} `);
    if (
      locn === "r" &&
      (tile.area.getMinX() > this.area.getMaxX() ||
        tile.area.getMaxX() < this.area.getMaxX())
    )
      collector.push(`${this} r${dir} not aligned to ${tile} `);
    if (
      locn === "t" &&
      (tile.area.getMinY() > this.area.getMinY() ||
        tile.area.getMaxY() < this.area.getMinY())
    )
      collector.push(`${this} t${dir} not aligned to ${tile} `);
    if (
      locn === "b" &&
      (tile.area.getMinY() > this.area.getMaxY() ||
        tile.area.getMaxY() < this.area.getMaxY())
    )
      collector.push(`${this} b${dir} not aligned to ${tile} `);
  }

  public checkStitches(total_area: Area, collector: string[]): void {
    this.checkStitch(total_area, collector, "b", "l");
    this.checkStitch(total_area, collector, "b", "r");
    this.checkStitch(total_area, collector, "r", "t");
    this.checkStitch(total_area, collector, "r", "b");
    this.checkStitch(total_area, collector, "t", "l");
    this.checkStitch(total_area, collector, "t", "r");
    this.checkStitch(total_area, collector, "l", "t");
    this.checkStitch(total_area, collector, "l", "b");
  }

  public findSolidTileWithinArea(area: Area): Tile {
    let out = null;
    if (this.isSolid()) {
      out = this;
    } else if (
      this.area.getMaxX() < area.getMaxX() &&
      this.br &&
      this.br.isSolid()
    ) {
      out = this.br;
    } else {
      let right: Tile = this.lt;
      while (right && right.getArea().getMaxX() < area.getMinX()) {
        right = right.br;
      }
      if (right) {
        out = right.findSolidTileWithinArea(area);
      }
    }
    return out;
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
    dir: Ref,
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

  public getAllStitches(): [
    lt: Tile,
    rt: Tile,
    tr: Tile,
    br: Tile,
    rb: Tile,
    lb: Tile,
    bl: Tile,
    tl: Tile
  ] {
    return [
      this.lt,
      this.rt,
      this.tr,
      this.br,
      this.rb,
      this.lb,
      this.bl,
      this.tl,
    ];
  }

  public getArea(): Area {
    return this.area;
  }

  public getBlock(): Block {
    return this.block;
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

  public getNeighbours(): Tile[] {
    const all_neighbours = [];
    this.forEachNeighbour((neighbour) => all_neighbours.push(neighbour));
    return all_neighbours;
  }

  public getStitch(ref: Ref): Tile {
    return this[ref];
  }

  public isSolid(): boolean {
    return !!this.block;
  }

  public setAllStitches(
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

  public setArea(area: Area): void {
    this.area = area;
  }

  public setStitch(ref: Ref, tile: Tile): void {
    if (!/^[tbrl]{2}$/.exec(ref)) {
      throw new Error(`invalid corner tile ref: ${ref}`);
    }
    this[ref] = tile;
  }

  public setHeight(height: number) {} // ignore

  public shrinkToFitAbove(cs: CornerStitch, block_tile: Tile): Tile {
    const orig_area = this.area;
    const orig_neighbours = this.getNeighbours();
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
    orig_neighbours.forEach((neighbour) => {
      neighbour.updateMutualStitches(new_spacer);
    });
    this.updateMutualStitches(new_spacer);
    return new_spacer;
  }

  public shrinkToFitBelow(cs: CornerStitch, block_tile: Tile): Tile {
    const orig_area = this.area;
    const orig_neighbours = this.getNeighbours();
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
    orig_neighbours.forEach((neighbour) => {
      neighbour.updateMutualStitches(new_spacer);
    });
    this.updateMutualStitches(new_spacer);
    return new_spacer;
  }

  public splitAroundBlock(
    cs: CornerStitch,
    block_tile: Tile,
    above_left: Tile,
    above_right: Tile
  ): Tile {
    const orig_area = this.area;
    const orig_neighbours = this.getNeighbours();
    this.area = new Area(
      this.area.getTopLeft(),
      new Point(block_tile.area.getMinX() - 1, this.area.getMaxY())
    );
    let new_left: Tile = this;
    if (
      this.area.getMinX() === above_left.area.getMinX() &&
      this.area.getMaxX() === above_left.area.getMaxX()
    ) {
      above_left.area = new Area(
        above_left.area.getTopLeft(),
        this.area.getBottomRight()
      );
      new_left = above_left;
      cs.removeTile(this);
    }
    const new_area = new Area(
      new Point(block_tile.area.getMaxX() + 1, orig_area.getMinY()),
      orig_area.getBottomRight()
    );
    let new_right: Tile;
    if (
      new_area.getMinX() === above_right.area.getMinX() &&
      new_area.getMaxX() === above_right.area.getMaxX()
    ) {
      above_right.area = new Area(
        above_right.area.getTopLeft(),
        new_area.getBottomRight()
      );
      new_right = above_right;
    } else {
      new_right = cs.addTile(new_area);
    }
    // console.log(
    //   `splitAroundBlock(${orig_area}) -> ${new_left.area} + ${new_right.area}`
    // );
    // console.log(`  neighbours: ${orig_neighbours}`);
    new_left.updateMutualStitches(new_right);
    block_tile.updateMutualStitches(new_right);
    new_left.updateMutualStitches(block_tile);
    orig_neighbours.forEach((neighbour) => {
      neighbour.updateMutualStitches(new_left);
      neighbour.updateMutualStitches(block_tile);
      neighbour.updateMutualStitches(new_right);
    });
    block_tile.br = new_right; // fix neighbour-finding algo in next pass
    return new_right;
  }

  public sweep(
    dir: Side,
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
      let ith_tile: Tile = this[check_seq[dir][i]];
      if (ith_tile) {
        // console.log(`  testing ${dir} ${i} ${check_seq[dir][i]} --> ${ith_tile} ${ith_tile.getMaxY()}`)
        if (ith_tile.area.getMaxY() < y_level) {
          next_tile = ith_tile;
        }
      }
      i += 1;
    }
    if (next_tile) {
      if (i === 5) {
        y_level = Math.min(y_level, this.area.getMaxY());
        dir = dir === "r" ? "l" : "r"; // swap direction
        // console.log(`  turning... ${i} ${next_tile} ${y_level} ${dir}`);
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
    return `{${this.area} / ${
      (this.block && this.block.getName()) || "spacer"
    }}`;
  }

  public updateMutualStitches(other: Tile): void {
    const this_area = {
      minX: this.area.getMinX(),
      minY: this.area.getMinY(),
      maxX: this.area.getMaxX(),
      maxY: this.area.getMaxY(),
    };
    const other_area = {
      minX: other.area.getMinX(),
      minY: other.area.getMinY(),
      maxX: other.area.getMaxX(),
      maxY: other.area.getMaxY(),
    };
    const adjacent = {
      t: this_area.minY === other_area.maxY + 1, // other is above this
      r: this_area.maxX + 1 === other_area.minX, // other is to right of this
      b: this_area.maxY + 1 === other_area.minY, // other is below this
      l: this_area.minX === other_area.maxX + 1, // other is to left of this
    };

    const this_overlap = {
      // this tile overlaps other's edges
      t: this_area.minY <= other_area.minY && this_area.maxY >= other_area.minY,
      r: this_area.minX <= other_area.maxX && this_area.maxX >= other_area.maxX,
      b: this_area.minY <= other_area.maxY && this_area.maxY >= other_area.maxY,
      l: this_area.minX <= other_area.minX && this_area.maxX >= other_area.minX,
    };
    if (adjacent.l && this_overlap.t) {
      other.tr = this;
    }
    if (adjacent.r && this_overlap.t) {
      other.tl = this;
    }
    if (adjacent.b && this_overlap.r) {
      other.rt = this;
    }
    if (adjacent.t && this_overlap.r) {
      other.rb = this;
    }
    if (adjacent.l && this_overlap.b) {
      other.br = this;
    }
    if (adjacent.r && this_overlap.b) {
      other.bl = this;
    }
    if (adjacent.b && this_overlap.l) {
      other.lt = this;
    }
    if (adjacent.t && this_overlap.l) {
      other.lb = this;
    }
    const othr_overlap = {
      // neighbour overlaps new tile's edges
      t: other_area.minY <= this_area.minY && other_area.maxY >= this_area.minY,
      r: other_area.minX <= this_area.maxX && other_area.maxX >= this_area.maxX,
      b: other_area.minY <= this_area.maxY && other_area.maxY >= this_area.maxY,
      l: other_area.minX <= this_area.minX && other_area.maxX >= this_area.minX,
    };
    if (adjacent.r && othr_overlap.t) {
      this.tr = other;
    }
    if (adjacent.l && othr_overlap.t) {
      this.tl = other;
    }
    if (adjacent.t && othr_overlap.r) {
      this.rt = other;
    }
    if (adjacent.b && othr_overlap.r) {
      this.rb = other;
    }
    if (adjacent.r && othr_overlap.b) {
      this.br = other;
    }
    if (adjacent.l && othr_overlap.b) {
      this.bl = other;
    }
    if (adjacent.t && othr_overlap.l) {
      this.lt = other;
    }
    if (adjacent.b && othr_overlap.l) {
      this.lb = other;
    }
  }
}
