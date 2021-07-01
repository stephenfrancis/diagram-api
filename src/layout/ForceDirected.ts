import * as Geom from "geom-api";
import Block from "../core/Block";
import Connector from "../core/Connector";
import Domain from "../core/Domain";
import ILayout from "./ILayout";

const sample_node: number = -1;

export default class ForceDirected implements ILayout {
  private attraction_constant: number;
  private def_spring_length: number;
  private finalized: boolean;
  private iterations: number;
  private min_disp_threshold: number;
  private max_iterations: number;
  private nodes: Node[];
  private repulsion_constant: number;
  private total_disp: number;

  constructor(
    attraction_constant: number,
    repulsion_constant: number,
    def_spring_length: number,
    max_iterations: number,
    min_disp_threshold: number
  ) {
    this.attraction_constant = attraction_constant;
    this.def_spring_length = def_spring_length;
    this.finalized = false;
    this.min_disp_threshold = min_disp_threshold;
    this.max_iterations = max_iterations;
    this.nodes = [];
    this.repulsion_constant = repulsion_constant;
  }

  public addBlock(block: Block): Node {
    this.throwIfFinalized();
    const node: Node = new Node(this, block);
    this.nodes.push(node);
    return node;
  }

  public addRelationship(from: Block, to: Block) {
    this.throwIfFinalized();
    const from_node: Node = this.getNodeFromBlock(from);
    const to_node: Node = this.getNodeFromBlock(to);
    from_node.addEdge(to_node);
    to_node.addEdge(from_node);
  }

  private allNodesCalcDisplacement(): number {
    let total_disp: number = 0;
    this.nodes.forEach((node: Node) => {
      total_disp += node.calcDisplacement();
      node.moveToNewPosition();
    });
    return total_disp;
  }

  private allNodesCalcForceAndVelocity(): void {
    if (sample_node >= 0 && sample_node < this.nodes.length) {
      console.log(`sampling node: ${this.nodes[0].getBlock().getName()}`);
    }
    this.nodes.forEach((node: Node, index: number) => {
      node.initializeForce();
      node.calcRepulsion(index === sample_node);
      node.calcAttraction(index === sample_node);
      node.updateVelocity();
      node.calcNewPosition();
    });
  }

  public begin(): void {
    this.throwIfFinalized();
    this.iterations = this.max_iterations;
    if (this.nodes.length < 2) {
      // throw new Error(`need at least 2 nodes, currently: ${this.nodes.length}`);
      this.iterations = 0; // skip further processing
    }
    this.total_disp = 0;
    this.reset();
  }

  public beginDomain(Domain: Domain): void {
    Domain.forEachBlock((block: Block) => {
      this.addBlock(block);
    });
    Domain.forEachBlock((block: Block) => {
      block.getConnectors().forEach((connector: Connector) => {
        this.addRelationship(block, connector.getTo());
      });
    });
    this.begin();
    this.setBlockPositionFromNodes();
  }

  private finalize(): void {
    this.throwIfFinalized();
    this.finalized = true;
  }

  public forEachNode(callback: (node: Node) => void): void {
    this.nodes.forEach(callback);
  }

  private getNodeFromBlock(block: Block): Node {
    let found_node: Node;
    this.nodes.forEach((node: Node) => {
      if (!found_node && node.getBlock() === block) {
        found_node = node;
      }
    });
    return found_node;
  }

  public getAttractionConstant(): number {
    return this.attraction_constant;
  }

  public getDefaultSpringLength(): number {
    return this.def_spring_length;
  }

  public getRepulsionConstant(): number {
    return this.repulsion_constant;
  }

  public getTotalDisplacement(): number {
    return this.total_disp;
  }

  public iterate(): boolean {
    this.throwIfFinalized();
    if (this.iterations < 1) {
      console.log(`no more iterations needed`);
      return;
    }
    this.allNodesCalcForceAndVelocity();
    this.iterations -= 1;
    this.total_disp = this.allNodesCalcDisplacement();
    this.setBlockPositionFromNodes();

    if (this.total_disp / this.nodes.length < this.min_disp_threshold) {
      this.iterations = 0;
    }
    const more_iterations_required: boolean = this.iterations > 0;
    if (!more_iterations_required) {
      this.finalize();
    }
    return more_iterations_required;
  }

  public reset(): void {
    this.nodes.forEach((node: Node) => {
      node.reset();
    });
  }

  public setBlockPositionFromNodes(): void {
    this.nodes.forEach((node: Node) => {
      node.setBlockPositionFromNode();
    });
  }

  private throwIfFinalized() {
    if (this.finalized) {
      throw new Error("finalized");
    }
  }
}

class Node {
  private block: Block;
  private fd: ForceDirected;
  private position: Geom.Point;
  private new_position: Geom.Point;
  private force: Geom.Vector;
  private velocity: Geom.Vector;
  private edges: Node[];

  constructor(fd: ForceDirected, block: Block) {
    this.block = block;
    this.edges = [];
    this.fd = fd;
  }

  public addEdge(other_node: Node) {
    this.edges.push(other_node);
  }

  public calcAttraction(sample: boolean): void {
    this.edges.forEach((other_node: Node) => {
      const v: Geom.Vector = this.calcAttractionForce(
        other_node,
        this.fd.getDefaultSpringLength()
      );
      this.force = this.force.add(v);
      if (sample) {
        this.outputVectors("attract", v);
      }
    });
  }

  public calcAttractionForce(
    other_node: Node,
    spring_length: number
  ): Geom.Vector {
    const between: Geom.Vector = this.getVectorTo(other_node);
    const proximity: number = Math.max(between.getMagnitude(), 1000);
    return new Geom.Vector(
      this.fd.getAttractionConstant() *
        Math.max(proximity - spring_length, 1000),
      between.getBearing()
    );
  }

  public calcDisplacement(): number {
    let v: Geom.Vector = Geom.Vector.fromOriginTo(this.new_position);
    v = v.subtract(Geom.Vector.fromOriginTo(this.position));
    return v.getMagnitude();
  }

  public calcNewPosition(): void {
    this.new_position = this.position.add(this.velocity.toPoint());
  }

  public calcRepulsion(sample: boolean): void {
    this.fd.forEachNode((other_node: Node) => {
      if (other_node !== this) {
        const v: Geom.Vector = this.calcRepulsionForce(other_node);
        this.force = this.force.add(v);
        if (sample) {
          this.outputVectors("repulse", v);
        }
      }
    });
  }

  public calcRepulsionForce(other_node: Node): Geom.Vector {
    const between: Geom.Vector = this.getVectorTo(other_node);
    const proximity: number = Math.max(between.getMagnitude(), 1000);
    return new Geom.Vector(
      -(this.fd.getRepulsionConstant() / Math.pow(proximity, 2)),
      between.getBearing()
    );
  }

  public getBlock(): Block {
    return this.block;
  }

  public getVectorTo(other_node: Node): Geom.Vector {
    const v: Geom.Vector = Geom.Vector.fromOriginTo(other_node.position);
    return v.subtract(Geom.Vector.fromOriginTo(this.position));
  }

  public initializeForce(): void {
    this.force = new Geom.Vector(0, 0);
  }

  public moveToNewPosition(): void {
    this.position = this.new_position;
  }

  private outputVectors(label: string, v: Geom.Vector): void {
    console.log(
      `${label} d: ${v} f: ${this.force} v: ${this.velocity} p: ${this.position}`
    );
  }

  public reset(): void {
    this.position = new Geom.Point(
      (0.1 + Math.random()) * 800,
      (0.1 + Math.random()) * 500
    );
    this.velocity = new Geom.Vector(0, 0);
  }

  public setBlockPositionFromNode(): void {
    this.block.setCentre(this.position);
    // console.log(`setBlockPositionFromNode() ${this.block}`);
  }

  public updateVelocity(): void {
    this.velocity = this.velocity.add(this.force);
  }
}
