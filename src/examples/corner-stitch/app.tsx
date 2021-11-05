import * as React from "react";
import CornerStitch, { Tile } from "../../layout/CornerStitch";
import Domain, { Phase } from "../../core/Domain";
import { Area, Point } from "geom-api";
import CornerStitchRender from "../../react/CornerStitchRender";

interface Props {}


const manualTileSetup = (cs: CornerStitch, d: Domain) => {
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

  spacer_1.setAllStitches(
    null,
    null,
    null,
    null,
    spacer_3,
    spacer_2,
    null,
    null
  );
  spacer_2.setAllStitches(
    spacer_1,
    spacer_1,
    block_tile_1,
    block_tile_1,
    spacer_6,
    spacer_6,
    null,
    null
  );
  block_tile_1.setAllStitches(
    spacer_1,
    spacer_1,
    spacer_3,
    spacer_4,
    spacer_6,
    spacer_6,
    spacer_2,
    spacer_2
  );
  spacer_3.setAllStitches(
    spacer_1,
    spacer_1,
    null,
    null,
    spacer_5,
    spacer_4,
    block_tile_1,
    block_tile_1
  );
  spacer_4.setAllStitches(
    spacer_3,
    spacer_3,
    block_tile_2,
    block_tile_2,
    spacer_6,
    spacer_6,
    block_tile_1,
    block_tile_1
  );
  block_tile_2.setAllStitches(
    spacer_3,
    spacer_3,
    spacer_5,
    spacer_5,
    spacer_7,
    spacer_7,
    spacer_6,
    spacer_4
  );
  spacer_5.setAllStitches(
    spacer_3,
    spacer_3,
    null,
    null,
    spacer_7,
    spacer_7,
    block_tile_2,
    block_tile_2
  );
  spacer_6.setAllStitches(
    spacer_2,
    spacer_4,
    block_tile_2,
    block_tile_2,
    spacer_7,
    spacer_7,
    null,
    null
  );
  spacer_7.setAllStitches(
    spacer_6,
    spacer_5,
    null,
    null,
    null,
    null,
    null,
    null
  );
}

const autoTileSetup = (cs: CornerStitch, d: Domain) => {
  cs.addBlock(new Area(new Point(400, 200), new Point(600, 400)),
    d.addBlock("block A"));
  cs.addBlock(new Area(new Point(610, 390), new Point(800, 450)),
    d.addBlock("block B"));
  console.log(cs.checkStitches().join("\n"));
}

const App: React.FC<Props> = (props) => {
  const [cornerStitch, setCornerStitch] = React.useState<CornerStitch>(null);

  React.useEffect(() => {
    const d = new Domain();
    const cs: CornerStitch = new CornerStitch(new Point(1000, 500));
    // manualTileSetup(cs, d);
    autoTileSetup(cs, d);
    

    setCornerStitch(cs);
  }, []);

  return (
    <div>{cornerStitch && renderCornerStitch(cornerStitch)}</div>
  );

}


const renderCornerStitch = (cornerStitch: CornerStitch) => {
  const points = {
    A: new Point(90, 290),
    B: new Point(210, 310),
    C: new Point(390, 190),
    D: new Point(410, 210),
    E: new Point(350, 250),
  }
  const tiles_in_area = [];
  cornerStitch.forEachTileInArea(points.C, points.D, (tile) => {
    tiles_in_area.push(tile.toString());
  });
  const output = (obj?: any) => {
    if (!obj) {
      return "<no value>";
    }
    return obj.toString();
  }

  const tiles_along_side = [];
  try {
  cornerStitch.findTileContaining(points.B).forEachNeighbour((tile: Tile) => {
    tiles_along_side.push(output(tile));
  })
  } catch (e) {
    console.error(e)
  }
  return (
  <>
    <CornerStitchRender cs={cornerStitch} />
    <ul>
      <li>findSolidTileWithinArea({output(points.A)}, {output(points.B)}): {output(cornerStitch.findSolidTileWithinArea(new Area(points.A, points.B)))}</li>
      <li>findTileContaining({output(points.E)}): {output(cornerStitch.findTileContaining(points.E))}</li>
      <li>forEachNeighbour({output(points.B)}): {tiles_along_side.toString()}</li>
      <li>forEachTileInArea({output(points.C)}, {output(points.D)}): {tiles_in_area.toString()}</li>
    </ul>
    <pre>
      {cornerStitch.checkStitches()}
    </pre>
  </>
)};

export default App;
