import * as Geom from "geom-api";
import Block from "../core/Block";
import Connector from "../core/Connector";
import Domain from "../core/Domain";
import ILayout from "./ILayout";

const constraints = {
  left: {
    x: 1,
    y: 0,
  },
  right: {
    x: -1,
    y: 0,
  },
  above: {
    x: 0,
    y: -1,
  },
  below: {
    x: 0,
    y: 1,
  },
  N: { x: 0, y: -2 },
  NE: { x: 2, y: -2 },
  E: { x: 2, y: 0 },
  SE: { x: 2, y: 2 },
  S: { x: 0, y: 2 },
  SW: { x: -2, y: 2 },
  W: { x: -2, y: 0 },
  NW: { x: -2, y: -2 },
  U: { x: 1, y: -1 },
  D: { x: -1, y: 1 },
};

export default class BellmanFord implements ILayout {
  private Domain: Domain;
  private finalized: boolean;
  private vertices: { [index: string]: Vertex };
  private blocks: string[];
  private start;

  constructor() {
    this.finalized = false;
    this.vertices = {};
    this.blocks = [];
    this.start = new Vertex("start", 0);
    this.vertices["start"] = this.start;
  }

  public addBlock(name: string) {
    this.throwIfFinalized();
    this.blocks.push(name);
    const x_vertex: Vertex = new Vertex(name + ".x");
    this.vertices[name + ".x"] = x_vertex;
    this.start.addEdge(x_vertex, 0);
    const y_vertex: Vertex = new Vertex(name + ".y");
    this.vertices[name + ".y"] = y_vertex;
    this.start.addEdge(y_vertex, 0);
  }

  public addRelationship(from: string, to: string, direction: string) {
    this.throwIfFinalized();
    if (!constraints[direction]) {
      throw new Error(`unrecognized direction: ${direction}`);
    }
    const from_x: Vertex = this.vertices[from + ".x"];
    const to_x: Vertex = this.vertices[to + ".x"];
    const from_y: Vertex = this.vertices[from + ".y"];
    const to_y: Vertex = this.vertices[to + ".y"];
    if (typeof constraints[direction].x === "number") {
      // console.log(`adding x edge between ${from} and ${to} of weight ${constraints[direction].x}`);
      from_x.addEdge(to_x, constraints[direction].x);
      to_x.addEdge(from_x, -constraints[direction].x);
    }
    if (typeof constraints[direction].y === "number") {
      // console.log(`adding y edge between ${from} and ${to} of weight ${constraints[direction].y}`);
      from_y.addEdge(to_y, constraints[direction].y);
      to_y.addEdge(from_y, -constraints[direction].y);
    }
  }

  public beginDomain(Domain: Domain) {
    this.Domain = Domain;
    Domain.forEachBlock((block: Block) => {
      this.addBlock(block.getName());
    });
    Domain.forEachBlock((block: Block) => {
      block.getConnectors().forEach((connector: Connector) => {
        this.addRelationship(
          block.getName(),
          connector.getTo().getName(),
          connector.getFromDirection().getId()
        );
      });
    });
  }

  private checkForNegativeWeightCycles(): boolean {
    let found: boolean = false;
    Object.keys(this.vertices).forEach((vertex_id) => {
      // found = found || this.vertices[vertex_id].checkForNegativeWeightCycles();
      // if (!found) {
      found = found || this.vertices[vertex_id].checkForNegativeWeightCycles();
      // }
    });
    return found;
  }

  private finalize(): void {
    this.throwIfFinalized();
    let trials: number = 7;
    do {
      console.log(`BellmanFord.finalize() trials left: ${trials}`);
      this.reset();
      this.relax();
    } while (this.checkForNegativeWeightCycles() && trials-- > 0);
    this.finalized = true;
  }

  public getVertex(name: string): Vertex {
    if (!this.finalized) {
      this.finalize();
    }
    return this.vertices[name];
  }

  public iterate(): boolean {
    this.finalize();
    this.Domain.forEachBlock((block: Block) => {
      const name: string = block.getName();
      block.setCentre(
        new Geom.Point(
          this.vertices[name + ".x"].getDistance(),
          this.vertices[name + ".y"].getDistance()
        )
      );
    });
    return false;
  }

  public output() {
    if (!this.finalized) {
      this.finalize();
    }
    const out: Array<{ name: string; distance: number; predecessor: string }> =
      [];
    Object.keys(this.vertices).forEach((vertex_id) => {
      out.push(this.vertices[vertex_id].output());
    });
    return out;
  }

  public outputBlocks() {
    if (!this.finalized) {
      this.finalize();
    }
    const out: string[] = [];
    this.blocks.forEach((name) => {
      out.push(
        name +
          ": " +
          this.vertices[name + ".x"].getDistance() +
          ", " +
          this.vertices[name + ".y"].getDistance()
      );
    });
    return out;
  }

  // Step 2: relax edges repeatedly
  //  for i from 1 to size(vertices)-1:
  private relax(): void {
    for (let i: number = 0; i < Object.keys(this.vertices).length; i += 1) {
      Object.keys(this.vertices).forEach((vertex_id) => {
        this.vertices[vertex_id].relax();
      });
    }
  }

  // Step 1: initialize graph
  //    private initializeGraph() {
  //     for each vertex v in vertices:
  //     distance[v] := inf             // At the beginning , all vertices have a weight of infinity
  //     predecessor[v] := null         // And a null predecessor
  private reset(): void {
    Object.keys(this.vertices).forEach((vertex_id) => {
      this.vertices[vertex_id].reset();
    });
  }

  // This implementation takes in a graph, represented as
  // lists of vertices and edges, and fills two arrays
  // (distance and predecessor) with shortest-path
  // (less cost/distance/metric) information

  // distance[source] := 0              // The weight is zero at the source

  //  }

  // Step 3: check for negative-weight cycles
  //  for each edge (u, v) with weight w in edges:
  //      if distance[u] + w < distance[v]:
  //          error "Graph contains a negative-weight cycle"

  private throwIfFinalized() {
    if (this.finalized) {
      throw new Error("finalized");
    }
  }
}

export interface Edge {
  to: Vertex;
  weight: number;
}

export class Vertex {
  private name: string;
  private edges: Edge[];
  private distance_init: number;
  private distance: number;
  private predecessor: Vertex;

  constructor(name: string, distance?: number) {
    this.name = name;
    this.edges = [];
    this.distance_init = typeof distance === "number" ? distance : 99999;
    this.reset();
  }

  public addEdge(to_vertex: Vertex, weight: number): void {
    this.edges.push({
      to: to_vertex,
      weight: weight,
    });
  }

  public checkForNegativeWeightCycles(): boolean {
    let found: boolean = false;
    let i: number = 0;
    while (i < this.edges.length && !found) {
      let edge = this.edges[i];
      if (this.distance + edge.weight < edge.to.distance) {
        found = true;
        console.log(
          `negative-weight cycle between ${this.name} and ${edge.to.name}`
        );
        this.edges.splice(i, 1);
      } else {
        i += 1;
      }
    }
    return found;
  }

  public getDistance(): number {
    return this.distance;
  }

  public getPredecessor(): Vertex {
    return this.predecessor;
  }

  public output(): { name: string; distance: number; predecessor: string } {
    return {
      name: this.name,
      distance: this.distance,
      predecessor: this.predecessor && this.predecessor.name,
    };
  }

  public relax(): void {
    // console.log(`calling relax() on ${this.name} having ${this.edges.length} edges`);
    this.edges.forEach((edge: Edge) => {
      if (this.distance + edge.weight < edge.to.distance) {
        // console.log(`found an edge to swap`);
        edge.to.distance = this.distance + edge.weight;
        edge.to.predecessor = this;
      }
    });
  }

  public reset(): void {
    this.distance = this.distance_init;
    this.predecessor = null;
  }
}
