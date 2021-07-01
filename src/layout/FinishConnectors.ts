import * as Geom from "geom-api";
import Block from "../core/Block";
import Domain from "../core/Domain";
import Connector from "../core/Connector";

export default class FinishConnectors {
  constructor() {}

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
      const from_dir: Geom.Direction = connector.getFromDirection();
      const from_anchor: Geom.Point = connector
        .getFrom()
        .getAnchorPoint(from_dir);
      first_line.setFrom(from_anchor);
    }
    if (last_line) {
      const to_dir: Geom.Direction = connector.getToDirection();
      const to_anchor: Geom.Point = connector.getTo().getAnchorPoint(to_dir);
      const v: Geom.Vector = Geom.Vector.between(to_anchor, last_line.getTo());
      last_line.setTo(to_anchor);
      // last_line.setArrowheadBearingTo(v.getBearing());
    }
  }

  public layoutDomain(Domain: Domain): void {
    Domain.forEachBlock((block: Block) => {
      this.doBlock(block);
    });
  }
}
