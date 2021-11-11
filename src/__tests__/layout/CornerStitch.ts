import CornerStitch, { Tile } from "../../layout/CornerStitch";
import Domain from "../../core/Domain";
import { Area, Point } from "geom-api";

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeTile: (expected: Tile) => CustomMatcherResult;
    }
  }
}

expect.extend({
  toBeTile(received: Tile, expected: Tile) {
    const rcvd_str = received && received.toString();
    const expt_str = expected && expected.toString();
    return {
      pass: rcvd_str === expt_str,
      message: () => `expected ${rcvd_str} to be ${expt_str}`,
    };
  },
});

test("updateMutualStitches", () => {
  const ud = undefined;
  const cs: CornerStitch = new CornerStitch(new Point(1000, 500));
  const t1 = cs.addTile(new Area(new Point(10, 10), new Point(19, 19)));
  const t2 = cs.addTile(new Area(new Point(20, 10), new Point(29, 19)));
  const t3 = cs.addTile(new Area(new Point(21, 20), new Point(30, 29)));
  const t4 = cs.addTile(new Area(new Point(11, 0), new Point(20, 9)));
  expect(t1.getAllStitches()).toEqual([ud, ud, ud, ud, ud, ud, ud, ud]);
  expect(t2.getAllStitches()).toEqual([ud, ud, ud, ud, ud, ud, ud, ud]);
  t1.updateMutualStitches(t2);
  expect(t1.getAllStitches()).toEqual([ud, ud, t2, t2, ud, ud, ud, ud]);
  expect(t2.getAllStitches()).toEqual([ud, ud, ud, ud, ud, ud, t1, t1]);
  t3.updateMutualStitches(t2);
  expect(t1.getAllStitches()).toEqual([ud, ud, t2, t2, ud, ud, ud, ud]);
  expect(t2.getAllStitches()).toEqual([ud, ud, ud, ud, t3, ud, t1, t1]);
  expect(t3.getAllStitches()).toEqual([t2, ud, ud, ud, ud, ud, ud, ud]);
  t4.updateMutualStitches(t1);
  t4.updateMutualStitches(t2);
  expect(t1.getAllStitches()).toEqual([ud, t4, t2, t2, ud, ud, ud, ud]);
  expect(t2.getAllStitches()).toEqual([t4, ud, ud, ud, t3, ud, t1, t1]);
  expect(t4.getAllStitches()).toEqual([ud, ud, ud, ud, t2, t1, ud, ud]);
});

test("findSolidTileWithinArea", () => {
  const d = new Domain();
  const cs: CornerStitch = new CornerStitch(new Point(50, 50));
  const b = cs.addBlock(
    new Area(new Point(10, 10), new Point(20, 20)),
    d.addBlock("block A")
  );
  expect(
    cs.findSolidTileWithinArea(new Area(new Point(15, 15), new Point(16, 16)))
  ).toBeTile(b);
  expect(
    cs.findSolidTileWithinArea(new Area(new Point(5, 5), new Point(16, 16)))
  ).toBeTile(b);
  expect(
    cs.findSolidTileWithinArea(new Area(new Point(5, 15), new Point(16, 16)))
  ).toBeTile(b);
  expect(
    cs.findSolidTileWithinArea(new Area(new Point(15, 15), new Point(16, 30)))
  ).toBeTile(b);
  expect(
    cs.findSolidTileWithinArea(new Area(new Point(15, 15), new Point(30, 16)))
  ).toBeTile(b);
});

test("adding one block in centre", () => {
  const d = new Domain();
  const cs: CornerStitch = new CornerStitch(new Point(1000, 500));
  cs.addBlock(
    new Area(new Point(400, 200), new Point(600, 400)),
    d.addBlock("block A")
  );

  expect(cs.checkStitches()).toEqual([]);

  const sp1 = cs.findTileContaining(new Point(0, 0));
  const sp2 = cs.findTileContaining(new Point(399, 200));
  const bl1 = cs.findTileContaining(new Point(400, 400));
  const sp3 = cs.findTileContaining(new Point(1000, 400));
  const sp4 = cs.findTileContaining(new Point(1000, 500));

  expect(sp1.getArea().getAttributes()).toEqual([0, 0, 1000, 199]); // min x, min y, width, height
  expect(sp1.getStitch("lt")).toBe(undefined);
  expect(sp1.getStitch("rt")).toBe(undefined);
  expect(sp1.getStitch("tl")).toBe(undefined);
  expect(sp1.getStitch("bl")).toBe(undefined);
  expect(sp1.getStitch("tr")).toBe(undefined);
  expect(sp1.getStitch("br")).toBe(undefined);
  expect(sp1.getStitch("lb")).toBeTile(sp2);
  expect(sp1.getStitch("rb")).toBeTile(sp3);

  expect(sp2.getArea().getAttributes()).toEqual([0, 200, 399, 200]); // min x, min y, width, height
  expect(sp2.getStitch("lt")).toBeTile(sp1);
  expect(sp2.getStitch("rt")).toBeTile(sp1);
  expect(sp2.getStitch("tl")).toBe(undefined);
  expect(sp2.getStitch("bl")).toBe(undefined);
  expect(sp2.getStitch("tr")).toBeTile(bl1);
  expect(sp2.getStitch("br")).toBeTile(bl1);
  expect(sp2.getStitch("lb")).toBeTile(sp4);
  expect(sp2.getStitch("rb")).toBeTile(sp4);

  expect(bl1.getArea().getAttributes()).toEqual([400, 200, 200, 200]); // min x, min y, width, height
  expect(bl1.getStitch("lt")).toBeTile(sp1);
  expect(bl1.getStitch("rt")).toBeTile(sp1);
  expect(bl1.getStitch("tl")).toBeTile(sp2);
  expect(bl1.getStitch("bl")).toBeTile(sp2);
  expect(bl1.getStitch("tr")).toBeTile(sp3);
  expect(bl1.getStitch("br")).toBeTile(sp3);
  expect(bl1.getStitch("lb")).toBeTile(sp4);
  expect(bl1.getStitch("rb")).toBeTile(sp4);

  expect(sp3.getArea().getAttributes()).toEqual([601, 200, 399, 200]); // min x, min y, width, height
  expect(sp3.getStitch("lt")).toBeTile(sp1);
  expect(sp3.getStitch("rt")).toBeTile(sp1);
  expect(sp3.getStitch("tl")).toBeTile(bl1);
  expect(sp3.getStitch("bl")).toBeTile(bl1);
  expect(sp3.getStitch("tr")).toBe(undefined);
  expect(sp3.getStitch("br")).toBe(undefined);
  expect(sp3.getStitch("lb")).toBeTile(sp4);
  expect(sp3.getStitch("rb")).toBeTile(sp4);

  expect(sp4.getArea().getAttributes()).toEqual([0, 401, 1000, 99]); // min x, min y, width, height
  expect(sp4.getStitch("lt")).toBeTile(sp2);
  expect(sp4.getStitch("rt")).toBeTile(sp3);
  expect(sp4.getStitch("tl")).toBe(undefined);
  expect(sp4.getStitch("bl")).toBe(undefined);
  expect(sp4.getStitch("tr")).toBe(undefined);
  expect(sp4.getStitch("br")).toBe(undefined);
  expect(sp4.getStitch("lb")).toBe(undefined);
  expect(sp4.getStitch("rb")).toBe(undefined);
});

test("adding two blocks", () => {
  const d = new Domain();
  const cs: CornerStitch = new CornerStitch(new Point(1000, 500));
  cs.addBlock(
    new Area(new Point(400, 200), new Point(600, 400)),
    d.addBlock("block A")
  );
  cs.addBlock(
    new Area(new Point(610, 390), new Point(800, 450)),
    d.addBlock("block B")
  );

  expect(cs.checkStitches()).toEqual([]);

  const sp1 = cs.findTileContaining(new Point(0, 0));
  const sp2 = cs.findTileContaining(new Point(399, 200));
  const bl1 = cs.findTileContaining(new Point(400, 400));
  const sp3 = cs.findTileContaining(new Point(1000, 389));
  const sp4 = cs.findTileContaining(new Point(601, 390));
  const bl2 = cs.findTileContaining(new Point(610, 450));
  const sp5 = cs.findTileContaining(new Point(801, 390));
  const sp6 = cs.findTileContaining(new Point(0, 401));
  const sp7 = cs.findTileContaining(new Point(1000, 451));

  expect(sp1.getArea().getAttributes()).toEqual([0, 0, 1000, 199]); // min x, min y, width, height
  expect(sp1.getStitch("lt")).toBe(undefined);
  expect(sp1.getStitch("rt")).toBe(undefined);
  expect(sp1.getStitch("tl")).toBe(undefined);
  expect(sp1.getStitch("bl")).toBe(undefined);
  expect(sp1.getStitch("tr")).toBe(undefined);
  expect(sp1.getStitch("br")).toBe(undefined);
  expect(sp1.getStitch("lb")).toBeTile(sp2);
  expect(sp1.getStitch("rb")).toBeTile(sp3);

  expect(sp2.getArea().getAttributes()).toEqual([0, 200, 399, 200]); // min x, min y, width, height
  expect(sp2.getStitch("lt")).toBeTile(sp1);
  expect(sp2.getStitch("rt")).toBeTile(sp1);
  expect(sp2.getStitch("tl")).toBe(undefined);
  expect(sp2.getStitch("bl")).toBe(undefined);
  expect(sp2.getStitch("tr")).toBeTile(bl1);
  expect(sp2.getStitch("br")).toBeTile(bl1);
  expect(sp2.getStitch("lb")).toBeTile(sp6);
  expect(sp2.getStitch("rb")).toBeTile(sp6);

  expect(bl1.getArea().getAttributes()).toEqual([400, 200, 200, 200]); // min x, min y, width, height
  expect(bl1.getStitch("lt")).toBeTile(sp1);
  expect(bl1.getStitch("rt")).toBeTile(sp1);
  expect(bl1.getStitch("tl")).toBeTile(sp2);
  expect(bl1.getStitch("bl")).toBeTile(sp2);
  expect(bl1.getStitch("tr")).toBeTile(sp3);
  expect(bl1.getStitch("br")).toBeTile(sp4);
  expect(bl1.getStitch("lb")).toBeTile(sp6);
  expect(bl1.getStitch("rb")).toBeTile(sp6);

  expect(sp3.getArea().getAttributes()).toEqual([601, 200, 399, 189]); // min x, min y, width, height
  expect(sp3.getStitch("lt")).toBeTile(sp1);
  expect(sp3.getStitch("rt")).toBeTile(sp1);
  expect(sp3.getStitch("tl")).toBeTile(bl1);
  expect(sp3.getStitch("bl")).toBeTile(bl1);
  expect(sp3.getStitch("tr")).toBe(undefined);
  expect(sp3.getStitch("br")).toBe(undefined);
  expect(sp3.getStitch("lb")).toBeTile(sp4);
  expect(sp3.getStitch("rb")).toBeTile(sp5);

  expect(sp4.getArea().getAttributes()).toEqual([601, 390, 8, 10]); // min x, min y, width, height
  expect(sp4.getStitch("lt")).toBeTile(sp3);
  expect(sp4.getStitch("rt")).toBeTile(sp3);
  expect(sp4.getStitch("tl")).toBeTile(bl1);
  expect(sp4.getStitch("bl")).toBeTile(bl1);
  expect(sp4.getStitch("tr")).toBeTile(bl2);
  expect(sp4.getStitch("br")).toBeTile(bl2);
  expect(sp4.getStitch("lb")).toBeTile(sp6);
  expect(sp4.getStitch("rb")).toBeTile(sp6);

  expect(bl2.getArea().getAttributes()).toEqual([610, 390, 190, 60]); // min x, min y, width, height
  expect(bl2.getStitch("lt")).toBeTile(sp3);
  expect(bl2.getStitch("rt")).toBeTile(sp3);
  expect(bl2.getStitch("tl")).toBeTile(sp4);
  expect(bl2.getStitch("bl")).toBeTile(sp6);
  expect(bl2.getStitch("tr")).toBeTile(sp5);
  expect(bl2.getStitch("br")).toBeTile(sp5);
  expect(bl2.getStitch("lb")).toBeTile(sp7);
  expect(bl2.getStitch("rb")).toBeTile(sp7);

  expect(sp5.getArea().getAttributes()).toEqual([801, 390, 199, 60]); // min x, min y, width, height
  expect(sp5.getStitch("lt")).toBeTile(sp3);
  expect(sp5.getStitch("rt")).toBeTile(sp3);
  expect(sp5.getStitch("tl")).toBeTile(bl2);
  expect(sp5.getStitch("bl")).toBeTile(bl2);
  expect(sp5.getStitch("tr")).toBe(undefined);
  expect(sp5.getStitch("br")).toBe(undefined);
  expect(sp5.getStitch("lb")).toBeTile(sp7);
  expect(sp5.getStitch("rb")).toBeTile(sp7);

  expect(sp6.getArea().getAttributes()).toEqual([0, 401, 609, 49]); // min x, min y, width, height
  expect(sp6.getStitch("lt")).toBeTile(sp2);
  expect(sp6.getStitch("rt")).toBeTile(sp4);
  expect(sp6.getStitch("tl")).toBe(undefined);
  expect(sp6.getStitch("bl")).toBe(undefined);
  expect(sp6.getStitch("tr")).toBeTile(bl2);
  expect(sp6.getStitch("br")).toBeTile(bl2);
  expect(sp6.getStitch("lb")).toBeTile(sp7);
  expect(sp6.getStitch("rb")).toBeTile(sp7);

  expect(sp7.getArea().getAttributes()).toEqual([0, 451, 1000, 49]); // min x, min y, width, height
  expect(sp7.getStitch("lt")).toBeTile(sp6);
  expect(sp7.getStitch("rt")).toBeTile(sp5);
  expect(sp7.getStitch("tl")).toBe(undefined);
  expect(sp7.getStitch("bl")).toBe(undefined);
  expect(sp7.getStitch("tr")).toBe(undefined);
  expect(sp7.getStitch("br")).toBe(undefined);
  expect(sp7.getStitch("lb")).toBe(undefined);
  expect(sp7.getStitch("rb")).toBe(undefined);
});

test("adding three blocks", () => {
  const d = new Domain();
  const cs: CornerStitch = new CornerStitch(new Point(1000, 500));
  cs.addBlock(
    new Area(new Point(400, 200), new Point(600, 400)),
    d.addBlock("block A")
  );
  cs.addBlock(
    new Area(new Point(610, 390), new Point(800, 450)),
    d.addBlock("block B")
  );
  cs.addBlock(
    new Area(new Point(100, 70), new Point(200, 270)),
    d.addBlock("block C")
  );

  expect(cs.checkStitches()).toEqual([]);

  // cs.forEachTile((t) =>
  //   console.log(
  //     `${t.toString()} ... ${cs.findTileContaining(t.getArea().getTopLeft())}`
  //   )
  // );

  const sp1 = cs.findTileContaining(new Point(0, 0));
  const sp2 = cs.findTileContaining(new Point(99, 270));
  const bl3 = cs.findTileContaining(new Point(200, 70));
  const sp3 = cs.findTileContaining(new Point(201, 199));
  const sp4 = cs.findTileContaining(new Point(399, 200));
  const bl1 = cs.findTileContaining(new Point(400, 400));
  const sp5 = cs.findTileContaining(new Point(1000, 389));
  const sp6 = cs.findTileContaining(new Point(0, 271));
  const sp7 = cs.findTileContaining(new Point(601, 390));
  const bl2 = cs.findTileContaining(new Point(610, 450));
  const sp8 = cs.findTileContaining(new Point(801, 390));
  const sp9 = cs.findTileContaining(new Point(0, 401));
  const sp10 = cs.findTileContaining(new Point(1000, 451));

  expect(sp1.getArea().getAttributes()).toEqual([0, 0, 1000, 69]); // min x, min y, width, height
  expect(sp1.getStitch("lt")).toBe(undefined);
  expect(sp1.getStitch("rt")).toBe(undefined);
  expect(sp1.getStitch("tl")).toBe(undefined);
  expect(sp1.getStitch("bl")).toBe(undefined);
  expect(sp1.getStitch("tr")).toBe(undefined);
  expect(sp1.getStitch("br")).toBe(undefined);
  expect(sp1.getStitch("lb")).toBeTile(sp2);
  expect(sp1.getStitch("rb")).toBeTile(sp3);

  expect(sp2.getArea().getAttributes()).toEqual([0, 70, 99, 200]); // min x, min y, width, height
  expect(sp2.getStitch("lt")).toBeTile(sp1);
  expect(sp2.getStitch("rt")).toBeTile(sp1);
  expect(sp2.getStitch("tl")).toBe(undefined);
  expect(sp2.getStitch("bl")).toBe(undefined);
  expect(sp2.getStitch("tr")).toBeTile(bl3);
  expect(sp2.getStitch("br")).toBeTile(bl3);
  expect(sp2.getStitch("lb")).toBeTile(sp6);
  expect(sp2.getStitch("rb")).toBeTile(sp6);

  expect(sp3.getArea().getAttributes()).toEqual([201, 70, 799, 129]); // min x, min y, width, height
  expect(sp3.getStitch("lt")).toBe(sp1);
  expect(sp3.getStitch("rt")).toBe(sp1);
  expect(sp3.getStitch("tl")).toBe(bl3);
  expect(sp3.getStitch("bl")).toBe(bl3);
  expect(sp3.getStitch("tr")).toBe(undefined);
  expect(sp3.getStitch("br")).toBe(undefined);
  expect(sp3.getStitch("lb")).toBeTile(sp4);
  expect(sp3.getStitch("rb")).toBeTile(sp5);

  expect(sp4.getArea().getAttributes()).toEqual([201, 200, 198, 70]); // min x, min y, width, height
  expect(sp4.getStitch("lt")).toBeTile(sp3);
  expect(sp4.getStitch("rt")).toBeTile(sp3);
  expect(sp4.getStitch("tl")).toBeTile(bl3);
  expect(sp4.getStitch("bl")).toBeTile(bl3);
  expect(sp4.getStitch("tr")).toBeTile(bl1);
  expect(sp4.getStitch("br")).toBeTile(bl1);
  expect(sp4.getStitch("lb")).toBeTile(sp6);
  expect(sp4.getStitch("rb")).toBeTile(sp6);

  expect(bl1.getArea().getAttributes()).toEqual([400, 200, 200, 200]); // min x, min y, width, height
  expect(bl1.getStitch("lt")).toBeTile(sp3);
  expect(bl1.getStitch("rt")).toBeTile(sp3);
  expect(bl1.getStitch("tl")).toBeTile(sp4);
  expect(bl1.getStitch("bl")).toBeTile(sp6);
  expect(bl1.getStitch("tr")).toBeTile(sp5);
  expect(bl1.getStitch("br")).toBeTile(sp7);
  expect(bl1.getStitch("lb")).toBeTile(sp9);
  expect(bl1.getStitch("rb")).toBeTile(sp9);

  expect(sp5.getArea().getAttributes()).toEqual([601, 200, 399, 189]); // min x, min y, width, height
  expect(sp5.getStitch("lt")).toBeTile(sp3);
  expect(sp5.getStitch("rt")).toBeTile(sp3);
  expect(sp5.getStitch("tl")).toBeTile(bl1);
  expect(sp5.getStitch("bl")).toBeTile(bl1);
  expect(sp5.getStitch("tr")).toBe(undefined);
  expect(sp5.getStitch("br")).toBe(undefined);
  expect(sp5.getStitch("lb")).toBeTile(sp7);
  expect(sp5.getStitch("rb")).toBeTile(sp8);

  expect(sp6.getArea().getAttributes()).toEqual([0, 271, 399, 129]); // min x, min y, width, height
  expect(sp6.getStitch("lt")).toBeTile(sp2);
  expect(sp6.getStitch("rt")).toBeTile(sp4);
  expect(sp6.getStitch("tl")).toBe(undefined);
  expect(sp6.getStitch("bl")).toBe(undefined);
  expect(sp6.getStitch("tr")).toBeTile(bl1);
  expect(sp6.getStitch("br")).toBeTile(bl1);
  expect(sp6.getStitch("lb")).toBeTile(sp9);
  expect(sp6.getStitch("rb")).toBeTile(sp9);

  expect(sp7.getArea().getAttributes()).toEqual([601, 390, 8, 10]); // min x, min y, width, height
  expect(sp7.getStitch("lt")).toBeTile(sp5);
  expect(sp7.getStitch("rt")).toBeTile(sp5);
  expect(sp7.getStitch("tl")).toBeTile(bl1);
  expect(sp7.getStitch("bl")).toBeTile(bl1);
  expect(sp7.getStitch("tr")).toBeTile(bl2);
  expect(sp7.getStitch("br")).toBeTile(bl2);
  expect(sp7.getStitch("lb")).toBeTile(sp9);
  expect(sp7.getStitch("rb")).toBeTile(sp9);

  expect(bl2.getArea().getAttributes()).toEqual([610, 390, 190, 60]); // min x, min y, width, height
  expect(bl2.getStitch("lt")).toBeTile(sp5);
  expect(bl2.getStitch("rt")).toBeTile(sp5);
  expect(bl2.getStitch("tl")).toBeTile(sp7);
  expect(bl2.getStitch("bl")).toBeTile(sp9);
  expect(bl2.getStitch("tr")).toBeTile(sp8);
  expect(bl2.getStitch("br")).toBeTile(sp8);
  expect(bl2.getStitch("lb")).toBeTile(sp10);
  expect(bl2.getStitch("rb")).toBeTile(sp10);

  expect(sp8.getArea().getAttributes()).toEqual([801, 390, 199, 60]); // min x, min y, width, height
  expect(sp8.getStitch("lt")).toBeTile(sp5);
  expect(sp8.getStitch("rt")).toBeTile(sp5);
  expect(sp8.getStitch("tl")).toBeTile(bl2);
  expect(sp8.getStitch("bl")).toBeTile(bl2);
  expect(sp8.getStitch("tr")).toBe(undefined);
  expect(sp8.getStitch("br")).toBe(undefined);
  expect(sp8.getStitch("lb")).toBeTile(sp10);
  expect(sp8.getStitch("rb")).toBeTile(sp10);

  expect(sp9.getArea().getAttributes()).toEqual([0, 401, 609, 49]); // min x, min y, width, height
  expect(sp9.getStitch("lt")).toBeTile(sp6);
  expect(sp9.getStitch("rt")).toBeTile(sp7);
  expect(sp9.getStitch("tl")).toBe(undefined);
  expect(sp9.getStitch("bl")).toBe(undefined);
  expect(sp9.getStitch("tr")).toBeTile(bl2);
  expect(sp9.getStitch("br")).toBeTile(bl2);
  expect(sp9.getStitch("lb")).toBeTile(sp10);
  expect(sp9.getStitch("rb")).toBeTile(sp10);

  expect(sp10.getArea().getAttributes()).toEqual([0, 451, 1000, 49]); // min x, min y, width, height
  expect(sp10.getStitch("lt")).toBeTile(sp9);
  expect(sp10.getStitch("rt")).toBeTile(sp8);
  expect(sp10.getStitch("tl")).toBe(undefined);
  expect(sp10.getStitch("bl")).toBe(undefined);
  expect(sp10.getStitch("tr")).toBe(undefined);
  expect(sp10.getStitch("br")).toBe(undefined);
  expect(sp10.getStitch("lb")).toBe(undefined);
  expect(sp10.getStitch("rb")).toBe(undefined);
});
