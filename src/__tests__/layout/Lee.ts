
import Block from "../core/Block";
import Diagram from "../core/Diagram";
import Direction from "../core/Direction";
import FileOutput from "../drawing/FileOutput";
import FinishConnectors from "../../layout/FinishConnectors";
import Lee from "../../layout/Lee";
import Scale from "../../layout/Scale";


const makeBasicDiagram = () => {
  const d: Diagram = new Diagram();
  d.setTitle("Lee Test");
  const b1: Block = new Block("top_left"    , 1, 1);
  d.addBlock(b1);
  const b3: Block = new Block("bottom_right", 5, 5);
  d.addBlock(b3);
  return d;
};

const finishConnectors = (d: Diagram) => {
  const f: FinishConnectors = new FinishConnectors();
  f.layoutDiagram(d);
}

const writeDiagram = (d: Diagram, filename: string) => {
  const s: Scale = new Scale("svg");
  s.beginDiagram(d);
  while (s.iterate());
  finishConnectors(d);
  (new FileOutput(d)).write(filename);
};

const addMiddleObstruction = (d: Diagram) => {
  const b2: Block = new Block("middle", 3, 3);
  d.addBlock(b2);
};

const addBottomLeftObstruction = (d: Diagram) => {
  const b2: Block = new Block("bottom_left", 1, 5);
  d.addBlock(b2);
};

const addTopRightObstruction = (d: Diagram) => {
  const b2: Block = new Block("top_right", 5, 1);
  d.addBlock(b2);
};


test("check basic diagram", () => {
  const d = makeBasicDiagram();
  const b1 = d.getBlock("top_left");
  const b3 = d.getBlock("bottom_right");
  b1.addConnector(b3, Direction.get("E"), Direction.get("W"));

  expect(b1.output()).toEqual("<top_left> at [1, 1]\n\
  E to <bottom_right> at [5, 5] W");
  expect(b3.output()).toEqual("<bottom_right> at [5, 5]");

  writeDiagram(d, "./dist/lee_test_1.html");
});


test("no obstructions, E -> W", () => {
  const d = makeBasicDiagram();
  const b1 = d.getBlock("top_left");
  const b3 = d.getBlock("bottom_right");
  b1.addConnector(b3, Direction.get("E"), Direction.get("W"));

  const l: Lee = new Lee();
  // console.log(l.output());
  l.beginDiagram(d);
  while (l.iterate());

  expect(b1.output()).toEqual("<top_left> at [1, 1]\n\
  E to <bottom_right> at [5, 5] W, [1, 1] - [2, 1], [2, 1] - [2, 5], [2, 5] - [4, 5], [4, 5] - [5, 5]");
  expect(b3.output()).toEqual("<bottom_right> at [5, 5]");

  writeDiagram(d, "./dist/lee_test_2.html");
});


test("no obstructions, N -> S", () => {
  const d = makeBasicDiagram();
  const b1 = d.getBlock("top_left");
  const b3 = d.getBlock("bottom_right");
  b1.addConnector(b3, Direction.get("S"), Direction.get("N"));

  const l: Lee = new Lee();
  l.beginDiagram(d);
  while (l.iterate());

  expect(b1.output()).toEqual("<top_left> at [1, 1]\n\
  S to <bottom_right> at [5, 5] N, [1, 1] - [1, 2], [1, 2] - [5, 2], [5, 2] - [5, 4], [5, 4] - [5, 5]");
  expect(b3.output()).toEqual("<bottom_right> at [5, 5]");

  writeDiagram(d, "./dist/lee_test_3.html");
});


test("centre obstruction, E -> W", () => {
  const d = makeBasicDiagram();
  addMiddleObstruction(d);
  const b1 = d.getBlock("top_left");
  const b2 = d.getBlock("middle");
  const b3 = d.getBlock("bottom_right");
  b1.addConnector(b3, Direction.get("E"), Direction.get("W"));

  const l: Lee = new Lee();
  // console.log(l.output());
  l.beginDiagram(d);
  while (l.iterate());

  expect(b1.output()).toEqual("<top_left> at [1, 1]\n\
  E to <bottom_right> at [5, 5] W, [1, 1] - [2, 1], [2, 1] - [2, 5], [2, 5] - [4, 5], [4, 5] - [5, 5]");
  expect(b2.output()).toEqual("<middle> at [3, 3]");
  expect(b3.output()).toEqual("<bottom_right> at [5, 5]");

  writeDiagram(d, "./dist/lee_test_4.html");
});


test("centre obstruction, N -> S", () => {
  const d = makeBasicDiagram();
  addMiddleObstruction(d);
  const b1 = d.getBlock("top_left");
  const b2 = d.getBlock("middle");
  const b3 = d.getBlock("bottom_right");
  b1.addConnector(b3, Direction.get("S"), Direction.get("N"));

  const l: Lee = new Lee();
  l.beginDiagram(d);
  while (l.iterate());

  expect(b1.output()).toEqual("<top_left> at [1, 1]\n\
  S to <bottom_right> at [5, 5] N, [1, 1] - [1, 2], [1, 2] - [5, 2], [5, 2] - [5, 4], [5, 4] - [5, 5]");
  expect(b2.output()).toEqual("<middle> at [3, 3]");
  expect(b3.output()).toEqual("<bottom_right> at [5, 5]");

  writeDiagram(d, "./dist/lee_test_5.html");
});


test("no obstructions, W -> S", () => {
  const d = makeBasicDiagram();
  const b1 = d.getBlock("top_left");
  const b3 = d.getBlock("bottom_right");
  b1.addConnector(b3, Direction.get("S"), Direction.get("W"));

  const l: Lee = new Lee();
  l.beginDiagram(d);
  while (l.iterate());

  expect(b1.output()).toEqual("<top_left> at [1, 1]\n\
  S to <bottom_right> at [5, 5] W, [1, 1] - [1, 2], [1, 2] - [1, 5], [1, 5] - [4, 5], [4, 5] - [5, 5]");
  expect(b3.output()).toEqual("<bottom_right> at [5, 5]");

  writeDiagram(d, "./dist/lee_test_6.html");
});


test("bottom left obstruction, W -> S", () => {
  const d = makeBasicDiagram();
  addBottomLeftObstruction(d);
  const b1 = d.getBlock("top_left");
  const b3 = d.getBlock("bottom_right");
  b1.addConnector(b3, Direction.get("S"), Direction.get("W"));

  const l: Lee = new Lee();
  l.beginDiagram(d);
  while (l.iterate());

  expect(b1.output()).toEqual("<top_left> at [1, 1]\n\
  S to <bottom_right> at [5, 5] W, [1, 1] - [1, 2], [1, 2] - [2, 2], [2, 2] - [2, 5], [2, 5] - [4, 5], [4, 5] - [5, 5]");
  expect(b3.output()).toEqual("<bottom_right> at [5, 5]");

  writeDiagram(d, "./dist/lee_test_7.html");
});


test("no obstructions, E -> N", () => {
  const d = makeBasicDiagram();
  const b1 = d.getBlock("top_left");
  const b3 = d.getBlock("bottom_right");
  b1.addConnector(b3, Direction.get("N"), Direction.get("E"));

  const l: Lee = new Lee();
  l.beginDiagram(d);
  while (l.iterate());

  expect(b1.output()).toEqual("<top_left> at [1, 1]\n\
  N to <bottom_right> at [5, 5] E, [1, 1] - [1, 0], [1, 0] - [6, 0], [6, 0] - [6, 5], [6, 5] - [6, 5], [6, 5] - [5, 5]");
  expect(b3.output()).toEqual("<bottom_right> at [5, 5]");

  writeDiagram(d, "./dist/lee_test_8.html");
});


test("top right obstruction, E -> N", () => {
  const d = makeBasicDiagram();
  addTopRightObstruction(d);
  const b1 = d.getBlock("top_left");
  const b3 = d.getBlock("bottom_right");
  b1.addConnector(b3, Direction.get("N"), Direction.get("E"));

  const l: Lee = new Lee();
  l.beginDiagram(d);
  while (l.iterate());

  expect(b1.output()).toEqual("<top_left> at [1, 1]\n\
  N to <bottom_right> at [5, 5] E, [1, 1] - [1, 0], [1, 0] - [6, 0], [6, 0] - [6, 5], [6, 5] - [6, 5], [6, 5] - [5, 5]");
  expect(b3.output()).toEqual("<bottom_right> at [5, 5]");

  writeDiagram(d, "./dist/lee_test_9.html");
});
