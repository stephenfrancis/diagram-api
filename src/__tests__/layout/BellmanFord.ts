/**
 * @jest-environment jsdom
 */

import BellmanFord from "../../layout/BellmanFord";

test("basic", () => {
  const bf = new BellmanFord();
  bf.addBlock("Author");
  bf.addBlock("Paper");
  bf.addBlock("Reviewer");
  bf.addBlock("Conference");
  bf.addRelationship("Author", "Paper", "left");
  bf.addRelationship("Paper", "Reviewer", "left");
  bf.addRelationship("Paper", "Conference", "above");

  // const output = bf.outputBlocks();
  // console.log(JSON.stringify(bf.outputBlocks()));
  expect(bf.getVertex("Author.x").getDistance()).toBe(-2);
  expect(bf.getVertex("Author.y").getDistance()).toBe(0);
  expect(bf.getVertex("Paper.x").getDistance()).toBe(-1);
  expect(bf.getVertex("Paper.y").getDistance()).toBe(0);
  expect(bf.getVertex("Reviewer.x").getDistance()).toBe(0);
  expect(bf.getVertex("Reviewer.y").getDistance()).toBe(0);
  expect(bf.getVertex("Conference.x").getDistance()).toBe(-1);
  expect(bf.getVertex("Conference.y").getDistance()).toBe(-1);
});
