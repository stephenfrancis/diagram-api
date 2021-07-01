import * as SVG from "svg-api";
import Domain from "../core/Domain";
// import BellmanFord from "../layout/BellmanFord";
import LayoutConnectors from "../layout/LayoutConnectors";

// const d: SVG.Diagram = new SVG.Diagram();
const d: Domain = new Domain();

const b1 = d.addBlock("Origin of All Things", 100, 50);
const b2 = d.addBlock("Destination of All Things", 250, 150);
const c = b1.addConnector(b2, "E", "N");
// b1.setPadding([ 0, 0, 0, 0, ]);
// c.addPathPoint(250,  50);
// c.addPathPoint(250, 150 - (b2.getHeight() / 2));

const layout = new LayoutConnectors(5);
layout.beginDomain(d);
while (layout.iterate());

const fm = new SVG.FileManager("./build/");
fm.saveAsSVG(d.draw(), "simple_diagram");
