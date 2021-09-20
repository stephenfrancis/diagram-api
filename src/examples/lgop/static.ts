import { readdirSync } from "fs";
import Domain, { Phase } from "../../core/Domain";
import MapLoader from "../../loaders/MapLoader";
import { FileManager, StyleSet } from "svg-api";
import BellmanFord from "../../layout/BellmanFord";
import FinishConnectors from "../../layout/FinishConnectors";
import LayoutConnectors from "../../layout/LayoutConnectors";
// import Lee from "../../layout/Lee";
import Scale from "../../layout/Scale";

const BLOCK_STYLESET = new StyleSet({
  stroke: "green",
  "stroke-width": "1px",
  fill: "#bbb",
  "font-size": "16px",
});

const CONNECTOR_STYLESET = new StyleSet({
  stroke: "green",
  "stroke-width": "3px",
  fill: "transparent",
  "font-size": "16px",
  "stroke-linejoin": "round",
});

const dir = readdirSync("src/examples/lgop/public", {
  encoding: "utf-8",
});

const convert = (file) => {
  const d = new Domain();
  const m = new MapLoader(d);
  m.readFile(`src/examples/lgop/public/${file}`);

  // const l: Lee = new Lee();
  // l.beginDomain(d);
  // while (l.iterate());

  d.setPhase(Phase.BlockLayout);

  const b = new BellmanFord();
  b.apply(d);

  const s: Scale = new Scale("svg");
  s.apply(d);

  d.setPhase(Phase.ConnectorLayout);
  const layout = new LayoutConnectors(4);
  layout.apply(d);

  // const f: FinishConnectors = new FinishConnectors();
  // f.layoutDomain(d);

  d.setPhase(Phase.Finalized);

  const fm = new FileManager("build/lgop");
  fm.saveAsSVG(d.draw(BLOCK_STYLESET, CONNECTOR_STYLESET), file);
};

dir.forEach((file) => {
  if (file.match(/\.md$/)) {
    convert(file);
  }
});
