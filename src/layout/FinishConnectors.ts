import * as Geom from "geom-api";
import Arrowhead from "../core/Arrowhead";
import Block from "../core/Block";
import Domain from "../core/Domain";
import Connector from "../core/Connector";
import { NonIterativeLayout } from "./ILayout";

export default class FinishConnectors implements NonIterativeLayout {
  constructor() {}

  public apply(Domain: Domain): void {
    Domain.forEachBlock((block: Block) => {
      this.doBlock(block);
    });
  }

  public doBlock(block: Block): void {
    block.getConnectors().forEach((connector: Connector) => {
      this.doConnector(connector);
    });
  }

  public doConnector(connector: Connector): void {
    let first_line: Geom.LineSegment = null;
    let last_line: Geom.LineSegment = null;
    connector.forEachLineSegment((line: Geom.LineSegment) => {
      if (!first_line) {
        first_line = line;
      }
      last_line = line;
    });
    if (first_line) {
      const fr_dir: Geom.Direction = connector.getFromDirection();
      const fr_anchor: Geom.Point = connector.getFrom().getAnchorPoint(fr_dir);
      first_line.setFrom(fr_anchor);

      if (connector.getDirectionality() === "two-way") {
        connector.setArrowheadStart(
          new Arrowhead(
            fr_anchor.getX(),
            fr_anchor.getY(),
            fr_dir.getAngle(),
            10
          )
        );
      }
    }
    if (last_line) {
      const to_dir: Geom.Direction = connector.getToDirection();
      const to_anchor: Geom.Point = connector.getTo().getAnchorPoint(to_dir);
      const v: Geom.Vector = Geom.Vector.between(to_anchor, last_line.getTo());
      last_line.setTo(to_anchor);
      // last_line.setArrowheadBearingTo(v.getBearing());

      if (connector.getDirectionality() !== "none") {
        connector.setArrowheadEnd(
          new Arrowhead(
            to_anchor.getX(),
            to_anchor.getY(),
            to_dir.getOppositeAngle(),
            10
          )
        );
      }
    }
  }
}
