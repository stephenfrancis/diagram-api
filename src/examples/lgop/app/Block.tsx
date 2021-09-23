import * as React from "react";
import { v4 as uuidv4 } from "uuid";
import RootLog from "loglevel";
import Connector from "./Connector";
import Direction from "./Direction";
import Point from "./Point";

const Log = RootLog.getLogger("lgop.Block");

export default class Block {
  private centre: Point;
  private connectors: Array<Connector>;
  private elmt_id: string;
  private height: number = 24;
  private link_text: string;
  private link_url: string;
  private name: string;
  private width: number = 120;

  constructor(name: string) {
    this.connectors = [];
    this.centre = new Point(0, 0);
    this.elmt_id = uuidv4();
    this.name = name;
  }

  public addConnector(
    to: Block,
    from_dir?: Direction,
    to_dir?: Direction
  ): Connector {
    const conn: Connector = new Connector(this, to, from_dir, to_dir);
    this.connectors.push(conn);
    return conn;
  }

  public getAnchorPoint(dir: Direction): Point {
    const point: Point = new Point(
      this.centre.getX() + this.width * dir.getAnchorPointFractionX(),
      this.centre.getY() + this.height * dir.getAnchorPointFractionY()
    );
    return point;
  }

  public getCentre(): Point {
    return this.centre;
  }

  public getName(): string {
    return this.name;
  }

  public setLink(link_url: string, link_text?: string) {
    this.link_url = link_url;
    this.link_text = link_text;
  }

  public svg(): JSX.Element {
    if (this.link_url) {
      return (
        <a href={this.link_url} key={"anchor_" + this.elmt_id}>
          {this.svgInternal()}
        </a>
      );
    } else {
      return this.svgInternal();
    }
  }

  public svgConnectors(): JSX.Element {
    const content: Array<JSX.Element> = [];
    this.connectors.forEach((connector) => {
      Log.info(`adding svg for connector: ${connector}`);
      content.push(connector.svg());
    });
    return <g key={this.elmt_id}>{content}</g>;
  }

  private svgInternal(): JSX.Element {
    if (!this.centre) {
      throw new Error(`block centre not defined`);
    }
    return (
      <>
        <rect
          x={this.centre.getX() - this.width / 2}
          y={this.centre.getY() - this.height / 2}
          width={this.width}
          height={this.height}
          key={"rect_" + this.elmt_id}
          fill="transparent"
          stroke="black"
        />
        {this.svgText()}
      </>
    );
  }

  public svgText(): JSX.Element {
    if (!this.centre) {
      throw new Error(`block centre not defined`);
    }
    return (
      <text
        x={this.centre.getX() - this.width / 2 + 4}
        y={this.centre.getY() - this.height / 2 + 16}
        key={"text_" + this.elmt_id}
      >
        {this.name}
      </text>
    );
  }

  public toString(): string {
    return `[[${this.name}]] at ${this.centre}`;
  }
}
