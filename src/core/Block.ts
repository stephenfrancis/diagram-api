import * as Geom from "geom-api";
import * as SVG from "svg-api";
import Connector, { Directionality } from "./Connector";
import Domain, { Phase } from "./Domain";

const DEFAULT_HEIGHT: number = 24;
const DEFAULT_WIDTH: number = 120;

export default class Block {
  private centre: Geom.Point;
  private connectors: Connector[];
  private readonly domain: Domain;
  private height?: number;
  private hover_text: string;
  private readonly id: string;
  private link_url: string;
  private name: string;
  private width?: number;

  constructor(
    domain: Domain,
    name: string,
    x_pos?: number,
    y_pos?: number,
    width?: number,
    height?: number
  ) {
    this.connectors = [];
    this.domain = domain;
    this.name = name;
    this.id = String(Math.random() * 10e16);
    if (typeof x_pos === "number" && typeof y_pos === "number") {
      this.setCentre(new Geom.Point(x_pos, y_pos));
      if (typeof width === "number") {
        this.setWidth(width);
      }
      if (typeof height === "number") {
        this.setHeight(height);
      }
    } else if (typeof x_pos === "number" || typeof y_pos === "number") {
      throw new Error(
        `either provide both x (${x_pos}) and y (${y_pos}), as numbers, or neither`
      );
    }
  }

  public addConnector(
    to: Block,
    directionality: Directionality,
    from_dir?: Geom.Direction | string,
    to_dir?: Geom.Direction | string
  ): Connector {
    if (typeof from_dir === "string") {
      from_dir = Geom.Direction.get(from_dir);
    }
    if (typeof to_dir === "string") {
      to_dir = Geom.Direction.get(to_dir);
    }
    const conn: Connector = new Connector(
      this,
      to,
      directionality,
      from_dir,
      to_dir
    );
    this.connectors.push(conn);
    return conn;
  }

  public copy(new_d: Domain): Block {
    const new_b: Block = new_d.addBlock(
      this.getName(),
      this.getCentre().getX(),
      this.getCentre().getY()
    );
    new_b.setHoverText(this.getHoverText());
    new_b.setLink(this.getLink());
    return new_b;
  }

  public draw(
    diagram: SVG.Diagram,
    block_styleset?: SVG.StyleSet,
    connector_styleset?: SVG.StyleSet
  ): SVG.Group {
    const group = diagram.main.addGroup(
      block_styleset
      // this.centre.getX() - (this.getWidth()  / 2),
      // this.centre.getY() - (this.getHeight() / 2)
    );
    // group.addRectangle(0, 0, this.getWidth(), this.getHeight());
    // group.addText(0, 0, this.getName());
    group.addRectangle(
      this.centre.getX(),
      this.centre.getY(),
      this.getWidth(),
      this.getHeight()
    );
    group.addTextBox(
      this.centre.getX(),
      this.centre.getY(),
      this.getName(),
      this.getWidth()
    );
    this.getConnectors().forEach((conn: Connector) => {
      conn.draw(diagram, connector_styleset);
    });
    return group;
  }

  public forEachConnector(callback: (conn: Connector) => void): void {
    this.getConnectors().forEach((conn: Connector) => {
      callback(conn);
    });
  }

  public getAnchorPoint(dir: Geom.Direction | string): Geom.Point {
    if (typeof dir === "string") {
      dir = Geom.Direction.get(dir);
    }
    const point: Geom.Point = new Geom.Point(
      this.centre.getX() + this.getWidth() * dir.getAnchorPointFractionX(),
      this.centre.getY() + this.getHeight() * dir.getAnchorPointFractionY()
    );
    return point;
  }

  public getArea(): Geom.Area {
    return new Geom.Area(this.getTopLeftPoint(), this.getBottomRightPoint());
  }

  public getBottomRightPoint(): Geom.Point {
    return new Geom.Point(
      this.getCentre().getX() + this.getWidth() / 2,
      this.getCentre().getY() + this.getHeight() / 2
    );
  }

  public getCentre(): Geom.Point {
    return this.centre;
  }

  public getConnectors(): Connector[] {
    return this.connectors;
  }

  public getHeight(): number {
    return typeof this.height === "number" ? this.height : DEFAULT_HEIGHT;
  }

  public getHoverText(): string {
    return this.hover_text;
  }

  public getId(): string {
    return this.id;
  }

  public getLink(): string {
    return this.link_url;
  }

  public getMaxX(): number {
    let out: number = this.getCentre().getX() + this.getWidth() / 2;
    const checkCoord = (point: Geom.Point) => {
      if (point.getX() > out) {
        out = point.getX();
      }
    };
    this.connectors.forEach((connector: Connector) => {
      connector.forEachLineSegment((line: Geom.LineSegment) => {
        checkCoord(line.getFrom());
        checkCoord(line.getTo());
      });
    });
    return out;
  }

  public getMaxY(): number {
    let out: number = this.getCentre().getY() + this.getHeight() / 2;
    const checkCoord = (point: Geom.Point) => {
      if (point.getY() > out) {
        out = point.getY();
      }
    };
    this.connectors.forEach((connector: Connector) => {
      connector.forEachLineSegment((line: Geom.LineSegment) => {
        checkCoord(line.getFrom());
        checkCoord(line.getTo());
      });
    });
    return out;
  }

  public getName(): string {
    return this.name;
  }

  public getTopLeftPoint(): Geom.Point {
    return new Geom.Point(
      this.getCentre().getX() - this.getWidth() / 2,
      this.getCentre().getY() - this.getHeight() / 2
    );
  }

  public getWidth(): number {
    return typeof this.width === "number" ? this.width : DEFAULT_WIDTH;
  }

  public output(): string {
    let out = this.toString();
    this.connectors.forEach((connector: Connector) => {
      out += "\n  " + connector.output();
    });
    return out;
  }

  public removeConnector(index: number): void {
    this.connectors.splice(index, 1);
  }

  public reset(): void {
    this.connectors.forEach((conn: Connector) => {
      conn.reset();
    });
  }

  public setCentre(point: Geom.Point): void {
    this.domain.checkPhaseDisallowed(Phase.Finalized);
    this.centre = point;
  }

  public setHeight(arg: number): void {
    console.log(`setting height of ${this.name} to ${arg}`);
    this.height = arg;
  }

  public setHoverText(hover_text: string): void {
    this.hover_text = hover_text;
  }

  public setLink(link_url: string) {
    this.link_url = link_url;
  }

  public setWidth(arg: number): void {
    this.width = arg;
  }

  public toString(): string {
    return `<${this.name}> at ${this.centre || "unpositioned"}`;
  }
}
