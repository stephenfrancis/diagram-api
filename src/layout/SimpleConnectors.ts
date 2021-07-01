import * as Geom from "geom-api";
import Block from "../core/Block";
import Domain from "../core/Domain";
import Connector from "../core/Connector";

export default class SimpleConnectors {
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
    const v: Geom.Vector = Geom.Vector.between(
      connector.getTo().getCentre(),
      connector.getFrom().getCentre()
    );
    const line: Geom.LineSegment = new Geom.LineSegment(
      connector.getFrom().getCentre(),
      connector.getTo().getCentre()
    ); // , null, v.getBearing() + 180
    connector.addLineSegment(line);
  }

  public doLevel2(connector: Connector): void {
    const v: Geom.Vector = Geom.Vector.between(
      connector.getTo().getCentre(),
      connector.getFrom().getCentre()
    );
    const to_dir: Geom.Direction = Geom.Direction.nearest(v.getBearing());
    const from_dir: Geom.Direction = Geom.Direction.nearest(
      180 + v.getBearing()
    );
    const from_anchor: Geom.Point = connector
      .getFrom()
      .getAnchorPoint(from_dir);
    const to_anchor: Geom.Point = connector.getTo().getAnchorPoint(to_dir);
    connector.addLineSegment(new Geom.LineSegment(from_anchor, to_anchor)); // , null, to_dir.getAngle() + 180
  }

  public doLevel3(connector: Connector): void {
    const from_dir: Geom.Direction = connector.getFromDirection();
    const from_anchor: Geom.Point = connector
      .getFrom()
      .getAnchorPoint(from_dir);
    const to_dir: Geom.Direction = connector.getToDirection();
    const to_anchor: Geom.Point = connector.getTo().getAnchorPoint(to_dir);
    connector.addLineSegment(new Geom.LineSegment(from_anchor, to_anchor)); // , null, to_dir.getAngle() + 180
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
    connector.addLineSegment(new Geom.LineSegment(to_shift, to_anchor)); // , null, v.getBearing() + 180
  }

  public layoutDomain(Domain: Domain): void {
    console.log(
      `SimpleConnectors.layoutDomain() sophistication: ${this.sophistication}`
    );
    Domain.forEachBlock((block: Block) => {
      this.doBlock(block);
    });
  }
}
