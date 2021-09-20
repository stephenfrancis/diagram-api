import { Direction } from "geom-api";
import Domain, { Phase } from "../../core/Domain";
import { FileManager, StyleSet } from "svg-api";
import FinishConnectors from "../../layout/FinishConnectors";
import Lee from "../../layout/Lee";
import Scale from "../../layout/Scale";

const makeBasicDiagram = () => {
  const d: Domain = new Domain();
  d.setTitle("Lee Test");
  d.addBlock("top_left", 1, 1);
  d.addBlock("bottom_right", 5, 5);
  return d;
};

const finishConnectors = (d: Domain) => {
  const f: FinishConnectors = new FinishConnectors();
  f.layoutDomain(d);
};

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

const writeDiagram = (d: Domain, filename: string) => {
  const s: Scale = new Scale("svg");
  s.apply(d);

  finishConnectors(d);

  d.setPhase(Phase.Finalized);
  const fm = new FileManager("build");
  fm.saveAsSVG(d.draw(BLOCK_STYLESET, CONNECTOR_STYLESET), filename);
};

const addMiddleObstruction = (d: Domain) => {
  d.addBlock("middle", 3, 3);
};

const addBottomLeftObstruction = (d: Domain) => {
  d.addBlock("bottom_left", 1, 5);
};

const addTopRightObstruction = (d: Domain) => {
  d.addBlock("top_right", 5, 1);
};

test("check basic diagram", () => {
  const d = makeBasicDiagram();
  const b1 = d.getBlock("top_left");
  const b3 = d.getBlock("bottom_right");
  b1.addConnector(b3, Direction.get("E"), Direction.get("W"));

  expect(b1.output()).toEqual(
    "<top_left> at [1, 1]\n\
  E to <bottom_right> at [5, 5] W"
  );
  expect(b3.output()).toEqual("<bottom_right> at [5, 5]");

  // writeDiagram(d, "lee_test_1");
});

test("no obstructions, E -> W", () => {
  const d = makeBasicDiagram();
  const b1 = d.getBlock("top_left");
  const b3 = d.getBlock("bottom_right");
  b1.addConnector(b3, Direction.get("E"), Direction.get("W"));

  d.setPhase(Phase.ConnectorLayout);
  const l: Lee = new Lee();
  // console.log(l.output());
  l.apply(d);

  expect(b1.output()).toEqual(
    "<top_left> at [1, 1]\n\
  E to <bottom_right> at [5, 5] W, [1, 1] - [2, 1], [2, 1] - [2, 5], [2, 5] - [4, 5], [4, 5] - [5, 5]"
  );
  expect(b3.output()).toEqual("<bottom_right> at [5, 5]");

  writeDiagram(d, "lee_test_2");
});

test("no obstructions, N -> S", () => {
  const d = makeBasicDiagram();
  const b1 = d.getBlock("top_left");
  const b3 = d.getBlock("bottom_right");
  b1.addConnector(b3, Direction.get("S"), Direction.get("N"));

  d.setPhase(Phase.ConnectorLayout);
  const l: Lee = new Lee();
  l.apply(d);

  expect(b1.output()).toEqual(
    "<top_left> at [1, 1]\n\
  S to <bottom_right> at [5, 5] N, [1, 1] - [1, 2], [1, 2] - [5, 2], [5, 2] - [5, 4], [5, 4] - [5, 5]"
  );
  expect(b3.output()).toEqual("<bottom_right> at [5, 5]");

  writeDiagram(d, "lee_test_3");
});

test("centre obstruction, E -> W", () => {
  const d = makeBasicDiagram();
  addMiddleObstruction(d);
  const b1 = d.getBlock("top_left");
  const b2 = d.getBlock("middle");
  const b3 = d.getBlock("bottom_right");
  b1.addConnector(b3, Direction.get("E"), Direction.get("W"));

  d.setPhase(Phase.ConnectorLayout);
  const l: Lee = new Lee();
  // console.log(l.output());
  l.apply(d);

  expect(b1.output()).toEqual(
    "<top_left> at [1, 1]\n\
  E to <bottom_right> at [5, 5] W, [1, 1] - [2, 1], [2, 1] - [2, 5], [2, 5] - [4, 5], [4, 5] - [5, 5]"
  );
  expect(b2.output()).toEqual("<middle> at [3, 3]");
  expect(b3.output()).toEqual("<bottom_right> at [5, 5]");

  writeDiagram(d, "lee_test_4");
});

test("centre obstruction, N -> S", () => {
  const d = makeBasicDiagram();
  addMiddleObstruction(d);
  const b1 = d.getBlock("top_left");
  const b2 = d.getBlock("middle");
  const b3 = d.getBlock("bottom_right");
  b1.addConnector(b3, Direction.get("S"), Direction.get("N"));

  d.setPhase(Phase.ConnectorLayout);
  const l: Lee = new Lee();
  l.apply(d);

  expect(b1.output()).toEqual(
    "<top_left> at [1, 1]\n\
  S to <bottom_right> at [5, 5] N, [1, 1] - [1, 2], [1, 2] - [5, 2], [5, 2] - [5, 4], [5, 4] - [5, 5]"
  );
  expect(b2.output()).toEqual("<middle> at [3, 3]");
  expect(b3.output()).toEqual("<bottom_right> at [5, 5]");

  writeDiagram(d, "lee_test_5");
});

test("no obstructions, W -> S", () => {
  const d = makeBasicDiagram();
  const b1 = d.getBlock("top_left");
  const b3 = d.getBlock("bottom_right");
  b1.addConnector(b3, Direction.get("S"), Direction.get("W"));

  d.setPhase(Phase.ConnectorLayout);
  const l: Lee = new Lee();
  l.apply(d);

  expect(b1.output()).toEqual(
    "<top_left> at [1, 1]\n\
  S to <bottom_right> at [5, 5] W, [1, 1] - [1, 2], [1, 2] - [1, 5], [1, 5] - [4, 5], [4, 5] - [5, 5]"
  );
  expect(b3.output()).toEqual("<bottom_right> at [5, 5]");

  writeDiagram(d, "lee_test_6");
});

test("bottom left obstruction, W -> S", () => {
  const d = makeBasicDiagram();
  addBottomLeftObstruction(d);
  const b1 = d.getBlock("top_left");
  const b3 = d.getBlock("bottom_right");
  b1.addConnector(b3, Direction.get("S"), Direction.get("W"));

  d.setPhase(Phase.ConnectorLayout);
  const l: Lee = new Lee();
  l.apply(d);

  expect(b1.output()).toEqual(
    "<top_left> at [1, 1]\n\
  S to <bottom_right> at [5, 5] W, [1, 1] - [1, 2], [1, 2] - [2, 2], [2, 2] - [2, 5], [2, 5] - [4, 5], [4, 5] - [5, 5]"
  );
  expect(b3.output()).toEqual("<bottom_right> at [5, 5]");

  writeDiagram(d, "lee_test_7");
});

test("no obstructions, E -> N", () => {
  const d = makeBasicDiagram();
  const b1 = d.getBlock("top_left");
  const b3 = d.getBlock("bottom_right");
  b1.addConnector(b3, Direction.get("N"), Direction.get("E"));

  d.setPhase(Phase.ConnectorLayout);
  const l: Lee = new Lee();
  l.apply(d);

  expect(b1.output()).toEqual(
    "<top_left> at [1, 1]\n\
  N to <bottom_right> at [5, 5] E, [1, 1] - [1, 0], [1, 0] - [6, 0], [6, 0] - [6, 5], [6, 5] - [6, 5], [6, 5] - [5, 5]"
  );
  expect(b3.output()).toEqual("<bottom_right> at [5, 5]");

  writeDiagram(d, "lee_test_8");
});

test("top right obstruction, E -> N", () => {
  const d = makeBasicDiagram();
  addTopRightObstruction(d);
  const b1 = d.getBlock("top_left");
  const b3 = d.getBlock("bottom_right");
  b1.addConnector(b3, Direction.get("N"), Direction.get("E"));

  d.setPhase(Phase.ConnectorLayout);
  const l: Lee = new Lee();
  l.apply(d);

  expect(b1.output()).toEqual(
    "<top_left> at [1, 1]\n\
  N to <bottom_right> at [5, 5] E, [1, 1] - [1, 0], [1, 0] - [6, 0], [6, 0] - [6, 5], [6, 5] - [6, 5], [6, 5] - [5, 5]"
  );
  expect(b3.output()).toEqual("<bottom_right> at [5, 5]");

  writeDiagram(d, "lee_test_9");
});
