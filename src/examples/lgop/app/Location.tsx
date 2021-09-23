import * as React from "react";
import { v4 as uuidv4 } from "uuid";
import Block from "./Block";
import Cell from "./Cell";
import Direction from "./Direction";
import Point from "./Point";

class Location {
  private block: Block;
  private col: number;
  private directions: { [index: string]: Location };
  private elmt_id: string;
  private positioned: boolean = false;
  private row: number;
  private z: number;
  private static locations: { [index: string]: Location } = {};

  constructor(name: string) {
    this.block = new Block(name);
    this.directions = {};
    this.elmt_id = uuidv4();
  }

  public addDirection(direction: string, other_location: string): void {
    const dir: Direction = Direction.get(direction);
    if (!dir) {
      throw new Error(`invalid direction code: ${direction}`);
    }
    if (this.directions[direction]) {
      throw new Error(`direction already specified: ${direction}`);
    }
    this.directions[direction] = Location.getLocation(other_location);
    this.block.addConnector(this.directions[direction].block, dir);
    this.positionRelativeIfNecessary(direction);
  }

  public addLink(link_url: string, link_text?: string): void {
    this.block.setLink(link_url, link_text);
  }

  public draw(done_locations?): JSX.Element {
    done_locations = done_locations || [];
    if (done_locations.indexOf(this) > -1) {
      return null;
    }
    this.setBlockCoordinates();
    const content: Array<JSX.Element> = [];
    content.push(this.block.svg());
    done_locations.push(this);
    Object.keys(this.directions).forEach((dir) => {
      content.push(this.directions[dir].draw(done_locations));
    });
    content.push(this.block.svgConnectors());
    return <g key={this.elmt_id}>{content}</g>;
  }

  public checkPositioned(): void {
    if (!this.positioned) {
      throw new Error(`location not positioned: ${this.getId()}`);
    }
  }

  public static clear(): void {
    Location.locations = {};
  }

  public getDirection(direction: string): Location {
    if (!this.directions[direction]) {
      throw new Error(`no location in this direction: ${direction}`);
    }
    return this.directions[direction];
  }

  public getDirections(): { [index: string]: Location } {
    return this.directions;
  }

  public getId(): string {
    return this.block.getName().replace(/\s+/g, "_").toLowerCase();
  }

  public static getLocation(name: string): Location {
    name = name.trim();
    if (!Location.locations[name]) {
      Location.locations[name] = new Location(name);
    }
    return Location.locations[name];
  }

  private positionRelativeIfNecessary(direction: string): void {
    this.checkPositioned();
    const other_location: Location = this.directions[direction];
    if (!other_location.positioned) {
      const d: Direction = Direction.get(direction);
      if (d) {
        other_location.setPosition(
          this.col + d.getDeltaCol(),
          this.row + d.getDeltaRow(),
          this.z + d.getDeltaZ()
        );
      }
    }
  }

  public setBlockCoordinates(): void {
    const point: Point = Cell.getCell(this.row, this.col).getPosition(this.z);
    console.log(`setBlockCoords() ${point.getX()}, ${point.getY()}`);
    this.block.getCentre().setX(point.getX());
    this.block.getCentre().setY(point.getY());
  }

  public setPosition(col: number, row: number, z: number): void {
    this.col = col;
    this.row = row;
    this.positioned = true;
    this.z = Cell.getCell(row, col).addLocation(this, z);
  }
}

export default Location;
