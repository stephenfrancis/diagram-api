import CornerStitch, { Tile } from "../layout/CornerStitch";
import * as Geom from "geom-api";
import * as SVG from "svg-api";

export default class DrawCornerStitch {
  private corner_stitch: CornerStitch;

  constructor(corner_stitch: CornerStitch) {
    this.corner_stitch = corner_stitch;
  }

  public draw(): SVG.Diagram {
    const d: SVG.Diagram = new SVG.Diagram();
    // const    top_left : Geom.Point = this.corner_stitch.getArea().getTopLeft();
    // const bottom_right: Geom.Point = this.corner_stitch.getArea().getBottomRight();
    // iterated separately, to ensure all connectors lie over all blocks
    this.corner_stitch.forEachTile((tile: Tile) => {
      const attrs = new Geom.Area(
        tile.getArea().getTopLeft(),
        tile.getArea().getBottomRight()
      ).getAttributes();
      d.main.addRectangle(...attrs);
      d.main.addText(attrs[0], attrs[1], tile.toString());
    });
    return d;
  }
}
