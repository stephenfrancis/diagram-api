import * as Fs from "fs";
import Block from "../../core/Block";
import CornerStitch, { Tile } from "../../layout/CornerStitch";
import Domain from "../../core/Domain";
import DrawCornerStitch from "../../examples/corner-stitch/DrawCornerStitch";
import { Area, Point } from "geom-api";
// import Point from "../core/Point";
// import { renderToString } from "react-dom/server";

test("basic", () => {
  const cs: CornerStitch = setupPattern();

  const draw: DrawCornerStitch = new DrawCornerStitch(cs);

  const head =
    "<!DOCTYPE html>" +
    '<html lang="en">' +
    "<head>" +
    "<title>Corner Stitch Test</title>" +
    '<meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />' +
    '<meta name="author" content="Stephen Francis">' +
    '<meta http-equiv="X-UA-Compatible" content="IE=edge" />' +
    '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />' +
    '<link rel="stylesheet" href="../public/svg.css" />' +
    "</head>" +
    "<body>" +
    "<h1>Corner Stitch Test</h1>";
  const foot = "</body></html>";

  Fs.writeFileSync("./build/cs.html", head + draw.draw().getMarkup() + foot, {
    encoding: "utf8",
  });

  cs.checkStitches();

  cs.sweep((tile: Tile) => {
    console.log(`sweep at ${tile}`);
  });
});

const setupPattern = () => {
  const d = new Domain();
  const cs: CornerStitch = new CornerStitch(new Point(1000, 500));
  const block_tile_1: Tile = cs.addTile(
    new Area(new Point(200, 100), new Point(399, 299)),
    d.addBlock("Block 1")
  );
  const block_tile_2: Tile = cs.addTile(
    new Area(new Point(600, 200), new Point(799, 399)),
    d.addBlock("Block 2")
  );

  const spacer_1 = cs.getFirstTile();
  spacer_1.setArea(
    new Area(spacer_1.getArea().getTopLeft(), new Point(999, 99))
  );
  // block_tile_1.setCornerTileRef("lt", spacer_1);
  // block_tile_1.setCornerTileRef("rt", spacer_1);

  const spacer_2 = cs.addTile(new Area(new Point(0, 100), new Point(199, 299)));
  // spacer_1.setCornerTileRef("lb", spacer_2);
  // spacer_2.setCornerTileRef("lt", spacer_1);
  // spacer_2.setCornerTileRef("rt", spacer_1);
  // spacer_2.setCornerTileRef("tr", block_tile_1);
  // block_tile_1.setCornerTileRef("tl", spacer_2);
  // spacer_2.setCornerTileRef("br", block_tile_1);
  // block_tile_1.setCornerTileRef("bl", spacer_2);

  const spacer_3 = cs.addTile(
    new Area(new Point(400, 100), new Point(999, 199))
  );
  // spacer_1.setCornerTileRef("rb", spacer_3);
  // spacer_3.setCornerTileRef("rt", spacer_1);
  // spacer_3.setCornerTileRef("lt", spacer_1);
  // spacer_3.setCornerTileRef("tl", block_tile_1);
  // block_tile_1.setCornerTileRef("tr", spacer_3);
  // spacer_3.setCornerTileRef("bl", block_tile_1);

  const spacer_4 = cs.addTile(
    new Area(new Point(400, 200), new Point(599, 299))
  );
  // spacer_4.setCornerTileRef("lt", spacer_3);
  // spacer_3.setCornerTileRef("lb", spacer_4);
  // spacer_4.setCornerTileRef("rt", spacer_3);

  const spacer_5 = cs.addTile(
    new Area(new Point(800, 200), new Point(999, 399))
  );

  const spacer_6 = cs.addTile(new Area(new Point(0, 300), new Point(599, 399)));

  const spacer_7 = cs.addTile(new Area(new Point(0, 400), new Point(999, 499)));

  spacer_1.setAllCornerTiles(
    null,
    null,
    null,
    null,
    spacer_3,
    spacer_2,
    null,
    null
  );
  spacer_2.setAllCornerTiles(
    spacer_1,
    spacer_1,
    block_tile_1,
    block_tile_1,
    spacer_6,
    spacer_6,
    null,
    null
  );
  block_tile_1.setAllCornerTiles(
    spacer_1,
    spacer_1,
    spacer_3,
    spacer_4,
    spacer_6,
    spacer_6,
    spacer_2,
    spacer_2
  );
  spacer_3.setAllCornerTiles(
    spacer_1,
    spacer_1,
    null,
    null,
    spacer_5,
    spacer_4,
    block_tile_1,
    block_tile_1
  );
  spacer_4.setAllCornerTiles(
    spacer_3,
    spacer_3,
    block_tile_2,
    block_tile_2,
    spacer_6,
    spacer_6,
    block_tile_1,
    block_tile_1
  );
  block_tile_2.setAllCornerTiles(
    spacer_3,
    spacer_3,
    spacer_5,
    spacer_5,
    spacer_7,
    spacer_7,
    spacer_6,
    spacer_4
  );
  spacer_5.setAllCornerTiles(
    spacer_3,
    spacer_3,
    null,
    null,
    spacer_7,
    spacer_7,
    block_tile_2,
    block_tile_2
  );
  spacer_6.setAllCornerTiles(
    spacer_2,
    spacer_4,
    block_tile_2,
    block_tile_2,
    spacer_7,
    spacer_7,
    null,
    null
  );
  spacer_7.setAllCornerTiles(
    spacer_6,
    spacer_5,
    null,
    null,
    null,
    null,
    null,
    null
  );
  return cs;
};
