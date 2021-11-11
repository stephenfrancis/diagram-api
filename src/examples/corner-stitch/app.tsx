import * as React from "react";
import CornerStitch, { Tile } from "../../layout/CornerStitch";
import Domain from "../../core/Domain";
import { Area, Point } from "geom-api";
import CornerStitchRender from "../../react/CornerStitchRender";

import styles from "./styles.css";

interface Props {}


const autoTileSetup = (cs: CornerStitch, d: Domain) => {
  cs.addBlock(new Area(new Point(400, 200), new Point(600, 400)),
    d.addBlock("block A"));
  cs.addBlock(new Area(new Point(610, 390), new Point(800, 450)),
    d.addBlock("block B"));
  cs.addBlock(new Area(new Point(100, 70), new Point(200, 270)),
    d.addBlock("block C"));
  console.log(cs.checkStitches().join("\n"));
}

const App: React.FC<Props> = (props) => {
  const [cornerStitch, setCornerStitch] = React.useState<CornerStitch>(null);
  const [domain, setDomain] = React.useState<Domain>(null);

  const addBlock = (left: number, top: number, width: number, height: number, label: string) => {
    console.log(`${left}, ${top}, ${width}, ${height}, ${label}`)
    cornerStitch.addBlock(new Area(new Point(left, top), new Point(left + width, top + height)),
      domain.addBlock(label));
  }

  const clear = () => {
    console.log(`clear`)
    const d = new Domain();
    const cs: CornerStitch = new CornerStitch(new Point(1000, 500));
    // autoTileSetup(cs, d);
    setDomain(d);
    setCornerStitch(cs);
  }


  React.useEffect(clear, []);

  return (
    // <div>{cornerStitch && renderCornerStitch(cornerStitch)}</div>
    <div className={styles.container}>
      {cornerStitch && <CornerStitchRender addBlock={addBlock} cs={cornerStitch} />}
    </div>
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
    <CornerStitchRender cs={cornerStitch} addBlock={() => {}} />
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
