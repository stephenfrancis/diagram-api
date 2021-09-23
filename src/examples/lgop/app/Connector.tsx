import * as React from "react";
import { v4 as uuidv4 } from "uuid";
import RootLog from "loglevel";
import Block from "./Block";
import Direction from "./Direction";
import Point from "./Point";

const Log = RootLog.getLogger("lgop.Connector");

export default class Connector {
  private elmt_id: string;
  private from: Block;
  private from_dir?: Direction;
  private to: Block;
  private to_dir?: Direction;

  constructor(
    from: Block,
    to: Block,
    from_dir?: Direction,
    to_dir?: Direction
  ) {
    this.elmt_id = uuidv4();
    this.from = from;
    this.from_dir = from_dir;
    this.to = to;
    this.to_dir = to_dir;
  }

  public getFrom(): Block {
    return this.from;
  }

  public getFromDirection(): Direction {
    return (
      this.from_dir ||
      this.from.getCentre().directionNearest(this.to.getCentre())
    );
  }

  public getTo(): Block {
    return this.to;
  }

  public getToDirection(): Direction {
    return (
      this.to_dir || this.to.getCentre().directionNearest(this.from.getCentre())
    );
  }

  public shift(from: Point, dir: Direction): Point {
    const len = 20;
    return new Point(
      from.getX() + len * dir.getAngleSin(),
      from.getY() - len * dir.getAngleCos()
    );
  }

  public svg(): JSX.Element {
    const from_dir: Direction = this.getFromDirection();
    const from_anchor: Point = this.from.getAnchorPoint(from_dir);
    const from_shift: Point = this.shift(from_anchor, from_dir);
    const to_dir: Direction = this.getToDirection();
    const to_anchor: Point = this.to.getAnchorPoint(to_dir);
    const to_shift: Point = this.shift(to_anchor, to_dir);
    const elbow: Point = new Point(from_shift.getX(), to_shift.getY());
    return (
      <g key={this.elmt_id} stroke="black">
        {this.svgLine(from_anchor, from_shift)}
        {this.svgLine(from_shift, elbow)}
        {this.svgLine(elbow, to_shift)}
        {this.svgLine(to_shift, to_anchor)}
        {this.svgArrowHead(to_anchor, to_dir.getAngle() + 180)}
      </g>
    );
  }

  public svgArrowHead(at: Point, rotate_angle: number): JSX.Element {
    const points: Array<Point> = [
      at,
      new Point(at.getX() - 3, at.getY() + 6),
      new Point(at.getX() + 3, at.getY() + 6),
    ];
    return this.svgPolygon(points, rotate_angle);
  }

  public svgLine(from: Point, to: Point): JSX.Element {
    const key = "line_" + uuidv4();
    return (
      <line
        key={key}
        x1={from.getX()}
        y1={from.getY()}
        x2={to.getX()}
        y2={to.getY()}
      />
    );
  }

  public svgPolygon(points: Array<Point>, rotate_angle: number): JSX.Element {
    const key = "polygon_" + uuidv4();
    let points_str: string = "";
    points.forEach((point) => {
      points_str += `${point.getX()}, ${point.getY()} `;
    });
    const transform = `rotate(${rotate_angle}, ${points[0].getX()}, ${points[0].getY()})`;
    return <polygon key={key} points={points_str} transform={transform} />;
  }

  public toString(): string {
    return `from ${this.from} ${this.from_dir} to ${this.to} ${this.to_dir}`;
  }
}
