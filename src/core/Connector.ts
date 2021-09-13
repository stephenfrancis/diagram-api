import * as Geom from "geom-api";
import * as SVG from "svg-api";
import Arrowhead from "./Arrowhead";
import Block from "./Block";
import Domain from "./Domain";

export type PathStyle = "right-angled" | "quad-bezier";

export default class Connector {
  private arrowhead_end: Arrowhead;
  private arrowhead_sta: Arrowhead;
  private from: Block;
  private from_dir?: Geom.Direction;
  private path_style: PathStyle;
  private to: Block;
  private to_dir?: Geom.Direction;
  private lines: Geom.LineSegment[];

  constructor(
    from: Block,
    to: Block,
    from_dir?: Geom.Direction,
    to_dir?: Geom.Direction
  ) {
    this.from = from;
    this.from_dir = from_dir;
    this.to = to;
    this.to_dir = to_dir;
    this.lines = [];
  }

  public addLineSegment(line: Geom.LineSegment): Connector {
    if (
      this.lines.length &&
      !this.lines[this.lines.length - 1].getTo().equals(line.getFrom())
    ) {
      throw new Error("lines don't join");
    }
    this.lines.push(line);
    return this;
  }

  public addPathPoint(point: Geom.Point): Connector {
    if (this.lines.length === 0) {
      throw new Error("no initial line segment");
    }
    if (this.lines[this.lines.length - 1].getTo().equals(point)) {
      throw new Error("new line has no extension");
    }
    this.addLineSegment(
      new Geom.LineSegment(this.lines[this.lines.length - 1].getTo(), point)
    );
    return this;
  }

  public amendNewPosition(position: Geom.Point, fraction: number): Geom.Point {
    if (!this.from_dir) {
      return;
    }
    const delta_x: number =
      this.from.getCentre().getX() * fraction * this.from_dir.getDeltaCol();
    const delta_y: number =
      this.from.getCentre().getY() * fraction * this.from_dir.getDeltaRow();
    return new Geom.Point(position.getX() + delta_x, position.getY() + delta_y);
  }

  public copy(new_d: Domain): Connector {
    const new_from: Block = new_d.getBlock(this.from.getName());
    const new_to: Block = new_d.getBlock(this.to.getName());
    const new_c: Connector = new_from.addConnector(
      new_to,
      this.getFromDirection(),
      this.getToDirection()
    );
    console.log(`copied connector from block ${new_from} going to ${new_to}`);
    new_c.setArrowheadStart(this.getArrowheadStart().copy());
    new_c.setArrowheadEnd(this.getArrowheadEnd().copy());
    this.forEachLineSegment((line: Geom.LineSegment) => {
      new_c.addLineSegment(new Geom.LineSegment(line.getFrom(), line.getTo()));
    });
    return new_c;
  }

  public draw(diagram: SVG.Diagram, styleset?: SVG.StyleSet): SVG.Group {
    if (this.lines.length < 1) {
      return null;
    }
    const group = diagram.main.addGroup(styleset);
    const path = group.addPath(
      this.lines[0].getFrom().getX(),
      this.lines[0].getFrom().getY()
    );
    this.lines.forEach((line: Geom.LineSegment) => {
      const new_x: number = line.getTo().getX();
      const new_y: number = line.getTo().getY();
      path.lineToAbsolute(new_x, new_y);
    });
    return group;
  }

  /*
  private drawArrowHead(to_path_point: [ number, number ], from_path_point: [ number, number ],
    style: ArrowheadStyle): string {

    if (style !== "basic") {
      return null;
    }
    const a = new Arrowhead(this.getStyleSet(), to_path_point[0], to_path_point[1],
      Math.atan2(to_path_point[1] - from_path_point[1], to_path_point[0] - from_path_point[0]) * 180 / Math.PI,
      this.arrowhead_size);
    return a.getMarkup();
  }
*/

  public forEachLineSegment(callback: (line: Geom.LineSegment) => void): void {
    this.lines.forEach((line: Geom.LineSegment) => {
      callback(line);
    });
  }

  public getArrowheadEnd(): Arrowhead {
    return this.arrowhead_end;
  }

  public getArrowheadStart(): Arrowhead {
    return this.arrowhead_sta;
  }

  /*
  public getExtremes(): Types.Extremes {
    const extremes: Types.Extremes = {
      x_min: Number.POSITIVE_INFINITY,
      y_min: Number.POSITIVE_INFINITY,
      x_max: Number.NEGATIVE_INFINITY,
      y_max: Number.NEGATIVE_INFINITY,
    };
    this.path_points.forEach((point: [ number, number ]) => {
      extremes.x_min = Math.min(extremes.x_min, point[0]);
      extremes.y_min = Math.min(extremes.y_min, point[1]);
      extremes.x_max = Math.max(extremes.x_max, point[0]);
      extremes.y_max = Math.max(extremes.y_max, point[1]);
    });
    return extremes;
  }
*/

  public getFrom(): Block {
    return this.from;
  }

  public getFromDirection(): Geom.Direction {
    if (this.from_dir) {
      return this.from_dir;
    }
    const v: Geom.Vector = Geom.Vector.between(
      this.to.getCentre(),
      this.from.getCentre()
    );
    return Geom.Direction.nearest(v.getBearing());
  }

  /*
  public getMarkup(): string {
    if (this.path_points.length < 2) {
      throw new Error("connector must have at least two path points");
    }
    let out: string = "<g "
      + this.getStyleSet().getStyleDefinition()
      + this.getTransformMarkup()
      + ">";
    const path_styles = Object.assign({}, this.getStyleSet(), {
      "fill": "none",
    });
    let path = new Path(new StyleSet(path_styles), this.path_points[0][0], this.path_points[0][1]);
    this.path_points.forEach((point: [ number, number ], index: number) => {
      if (index > 0) {
        if (this.path_style === "quad-bezier") {
          path.quadraticBezierSmoothAbsolute(point[0], point[1]);
        } else {
          path.lineToAbsolute(point[0], point[1]);
        }
      }
    });
    out += path.getMarkup();
    out += this.drawArrowHead(this.path_points[0], this.path_points[1], this.start_arrowhead);
    out += this.drawArrowHead(
      this.path_points[this.path_points.length - 1],
      this.path_points[this.path_points.length - 2],
      this.end_arrowhead);
    out += "</g>";
    return out;
  }
*/

  public getPathStyle(): PathStyle {
    return this.path_style;
  }

  public getTo(): Block {
    return this.to;
  }

  public getToDirection(): Geom.Direction {
    if (this.to_dir) {
      return this.to_dir;
    }
    const v: Geom.Vector = Geom.Vector.between(
      this.to.getCentre(),
      this.from.getCentre()
    );
    return Geom.Direction.nearest(v.getBearing());
  }

  public output(): string {
    let seg: string = "";
    this.lines.forEach((line: Geom.LineSegment) => {
      seg += ", " + line.toString();
    });
    return `${this.from_dir || ""} to ${this.to} ${this.to_dir || ""}${seg}`;
  }

  public reset(): void {
    this.lines = [];
  }

  public setArrowheadEnd(arrowhead: Arrowhead): void {
    this.arrowhead_end = arrowhead;
  }

  public setArrowheadStart(arrowhead: Arrowhead): void {
    this.arrowhead_sta = arrowhead;
  }

  public setPathStyle(arg: PathStyle): void {
    this.path_style = arg;
  }

  public shift(
    from: Geom.Point,
    dir: Geom.Direction,
    other_point: Geom.Point
  ): Geom.Point {
    const len = 20;
    const max_x: number = Math.abs(from.getX() - other_point.getX());
    const max_y: number = Math.abs(from.getY() - other_point.getY());
    return new Geom.Point(
      from.getX() + Math.min(len * dir.getAngleSin(), max_x / 2),
      from.getY() - Math.min(len * dir.getAngleCos(), max_y / 2)
    );
  }

  public toString(): string {
    return `from ${this.from} ${this.from_dir || ""} to ${this.to} ${
      this.to_dir || ""
    }`;
  }
}
