import * as SVG from "svg-api";
import Block from "./Block";
import Connector from "./Connector";

export enum Phase {
  AddingData = "ADDING-DATA",
  BlockLayout = "BLOCK-LAYOUT",
  ConnectorLayout = "CONNECTOR-LAYOUT",
  Finalized = "FINALIZED",
}

export default class Domain {
  private blocks: { [index: string]: Block };
  private phase: Phase;
  private title: string;

  constructor() {
    this.blocks = {};
    this.phase = Phase.AddingData;
  }

  public addBlock(name: string, x_pos?: number, y_pos?: number): Block {
    const block: Block = new Block(this, name, x_pos, y_pos);
    this.addBlockToDomain(block);
    return block;
  }

  private addBlockToDomain(block: Block): void {
    this.checkPhaseAllowed(Phase.AddingData);
    const name: string = block.getName();
    if (this.blocks[name]) {
      throw new Error(
        `a block with name ${name} already exists in this diagram`
      );
    }
    this.blocks[name] = block;
  }

  public checkPhaseAllowed(allowedPhase: Phase): void {
    if (this.phase !== allowedPhase) {
      throw new Error(
        `allowed phase ${allowedPhase} is not current phase ${this.phase}`
      );
    }
  }

  public checkPhaseDisallowed(disallowedPhase: Phase): void {
    if (this.phase === disallowedPhase) {
      throw new Error(
        `allowed phase ${disallowedPhase} is not current phase ${this.phase}`
      );
    }
  }

  public copy(): Domain {
    const new_d: Domain = new Domain();
    new_d.setTitle(this.getTitle());
    this.forEachBlock((block: Block) => {
      new_d.addBlockToDomain(block.copy(new_d));
      console.log(`copied block ${block.getName()}`);
    });
    this.forEachBlock((block: Block) => {
      const conns: Connector[] = block.getConnectors();
      for (let i: number = 0; i < conns.length; i += 1) {
        conns[i].copy(new_d);
      }
    });
    return new_d;
  }

  public draw(
    block_styleset?: SVG.StyleSet,
    connector_styleset?: SVG.StyleSet
  ): SVG.Diagram {
    this.checkPhaseAllowed(Phase.Finalized);
    const diagram = new SVG.Diagram();
    this.forEachBlock((block) => {
      block.draw(diagram, block_styleset, connector_styleset);
    });
    return diagram;
  }

  public forEachBlock(callback: (block: Block) => void): void {
    Object.keys(this.blocks).forEach((name) => {
      callback(this.blocks[name]);
    });
  }

  public getBlock(name: string): Block | null {
    return this.blocks[name];
  }

  public getBlockNames(): string[] {
    return Object.keys(this.blocks);
  }

  public getBlockThrowIfUnrecognized(name: string): Block {
    const block: Block = this.getBlock(name);
    if (!block) {
      throw new Error(`no block found with name ${name}`);
    }
    return block;
  }

  public getMaxX(): number {
    let max_x: number = Number.NEGATIVE_INFINITY;
    this.forEachBlock((block) => {
      const x: number = block.getMaxX();
      if (x > max_x) {
        max_x = x;
      }
    });
    return max_x + 10; // allow for border and connector paths
  }

  public getMaxY(): number {
    let max_y: number = Number.NEGATIVE_INFINITY;
    this.forEachBlock((block) => {
      const y: number = block.getMaxY();
      if (y > max_y) {
        max_y = y;
      }
    });
    return max_y + 10; // allow for border and connector paths
  }

  public getTitle(): string {
    return this.title;
  }

  public output(): string {
    let out = `  ${this.getTitle()}\n  ===============\n[${this.getMaxX()}, ${this.getMaxY()}]\n`;
    this.forEachBlock((block) => {
      out += "\n" + block.output();
    });
    return out;
  }

  public removeBlock(name: string): void {
    this.checkPhaseAllowed(Phase.AddingData);
    delete this.blocks[name];
  }

  public reset(): void {
    this.forEachBlock((block: Block) => {
      block.reset();
    });
  }

  public setPhase(newPhase: Phase): void {
    if (newPhase.charAt(0) <= this.phase.charAt(0)) {
      throw new Error(`invalid phase change: ${this.phase} -> ${newPhase}`);
    }
    if (newPhase === Phase.ConnectorLayout || newPhase === Phase.Finalized) {
      this.forEachBlock((block) => {
        if (!block.getCentre()) {
          throw new Error(
            `block(s) not positioned on phase change to ${newPhase}`
          );
        }
      });
    }
    if (newPhase === Phase.Finalized) {
      this.forEachBlock((block) => {
        block.forEachConnector((conn) => {
          if (conn.getLineSegments().length < 1) {
            throw new Error(
              `connector(s) not drawn on phase change to ${newPhase}`
            );
          }
        });
      });
    }
    this.phase = newPhase;
  }

  public setTitle(title: string): void {
    this.title = title;
  }
}
