import * as Geom from "geom-api";
import Block from "../core/Block";
import Domain, { Phase } from "../core/Domain";
import Connector from "../core/Connector";
import { NonIterativeLayout } from "./ILayout";
import Arrowhead from "../core/Arrowhead";

export default class SimpleConnectors implements NonIterativeLayout {
  private sophistication: number;

  constructor(sophistication: number) {
    if (
      sophistication < 1 ||
      sophistication > 4 ||
      !Number.isInteger(sophistication)
    ) {
      throw new Error(
        `sophistication should be an integer between 1 and 4, you gave ${sophistication}`
      );
    }
    this.sophistication = sophistication;
  }

  public apply(domain: Domain): void {
    domain.checkPhaseAllowed(Phase.ConnectorLayout);
    console.log(
      `SimpleConnectors.layoutDomain() sophistication: ${this.sophistication}`
    );
    domain.forEachBlock((block: Block) => {
      this.doBlock(block);
    });
  }

  public doBlock(block: Block): void {
    block.getConnectors().forEach((connector: Connector) => {
      this.doConnector(connector);
    });
  }

  public doConnector(connector: Connector): void {
    connector.reset();
    this["doLevel" + this.sophistication](connector);
  }

  public doLevel1(connector: Connector): void {
    const fr_anchor: Geom.Point = connector.getFrom().getCentre();
    const to_anchor: Geom.Point = connector.getTo().getCentre();
    const v: Geom.Vector = Geom.Vector.between(fr_anchor, to_anchor);
    const line: Geom.LineSegment = new Geom.LineSegment(fr_anchor, to_anchor); // , null, v.getBearing() + 180
    connector.addLineSegment(line);
    if (connector.getDirectionality() !== "none") {
      connector.setArrowheadEnd(
        new Arrowhead(to_anchor.getX(), to_anchor.getY(), v.getBearing(), 10)
      );
    }
    if (connector.getDirectionality() === "two-way") {
      connector.setArrowheadStart(
        new Arrowhead(fr_anchor.getX(), fr_anchor.getY(), v.getBearing(), 10)
      );
    }
  }

  public doLevel2(connector: Connector): void {
    const v: Geom.Vector = Geom.Vector.between(
      connector.getTo().getCentre(),
      connector.getFrom().getCentre()
    );
    const to_dir: Geom.Direction = Geom.Direction.nearest(v.getBearing());
    const fr_dir: Geom.Direction = Geom.Direction.nearest(180 + v.getBearing());
    const fr_anchor: Geom.Point = connector.getFrom().getAnchorPoint(fr_dir);
    const to_anchor: Geom.Point = connector.getTo().getAnchorPoint(to_dir);
    const v2: Geom.Vector = Geom.Vector.between(fr_anchor, to_anchor);
    connector.addLineSegment(new Geom.LineSegment(fr_anchor, to_anchor));
    if (connector.getDirectionality() !== "none") {
      connector.setArrowheadEnd(
        new Arrowhead(to_anchor.getX(), to_anchor.getY(), v2.getBearing(), 10)
      );
    }
    if (connector.getDirectionality() === "two-way") {
      connector.setArrowheadStart(
        new Arrowhead(fr_anchor.getX(), fr_anchor.getY(), v2.getBearing(), 10)
      );
    }
  }

  public doLevel3(connector: Connector): void {
    const fr_dir: Geom.Direction = connector.getFromDirection();
    const fr_anchor: Geom.Point = connector.getFrom().getAnchorPoint(fr_dir);
    const to_dir: Geom.Direction = connector.getToDirection();
    const to_anchor: Geom.Point = connector.getTo().getAnchorPoint(to_dir);
    const v2: Geom.Vector = Geom.Vector.between(fr_anchor, to_anchor);
    connector.addLineSegment(new Geom.LineSegment(fr_anchor, to_anchor));
    if (connector.getDirectionality() !== "none") {
      connector.setArrowheadEnd(
        new Arrowhead(to_anchor.getX(), to_anchor.getY(), v2.getBearing(), 10)
      );
    }
    if (connector.getDirectionality() === "two-way") {
      connector.setArrowheadStart(
        new Arrowhead(fr_anchor.getX(), fr_anchor.getY(), v2.getBearing(), 10)
      );
    }
  }

  public doLevel4(connector: Connector): void {
    const from_dir: Geom.Direction = connector.getFromDirection();
    const from_anchor: Geom.Point = connector
      .getFrom()
      .getAnchorPoint(from_dir);
    const to_dir: Geom.Direction = connector.getToDirection();
    const to_anchor: Geom.Point = connector.getTo().getAnchorPoint(to_dir);
    const from_shift: Geom.Point = connector.shift(
      from_anchor,
      from_dir,
      to_anchor
    );
    const to_shift: Geom.Point = connector.shift(
      to_anchor,
      to_dir,
      from_anchor
    );
    const elbow: Geom.Point = new Geom.Point(
      from_shift.getX(),
      to_shift.getY()
    );
    connector.addLineSegment(new Geom.LineSegment(from_anchor, from_shift));
    connector.addLineSegment(new Geom.LineSegment(from_shift, elbow));
    connector.addLineSegment(new Geom.LineSegment(elbow, to_shift));
    const v: Geom.Vector = Geom.Vector.between(to_anchor, to_shift);
    connector.addLineSegment(new Geom.LineSegment(to_shift, to_anchor));
    if (connector.getDirectionality() !== "none") {
      const v2: Geom.Vector = Geom.Vector.between(to_shift, to_anchor);
      connector.setArrowheadEnd(
        new Arrowhead(to_anchor.getX(), to_anchor.getY(), v2.getBearing(), 10)
      );
    }
  }
}
