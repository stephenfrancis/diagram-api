
export default class Direction {
  private id: string;
  private ang: number;
  private drow: number;
  private dcol: number;
  private dz: number;
  private static directions: { [index: string]: Direction, } = {};
  private static ordered: Array<Direction> = [];

  constructor(id: string, ang: number, drow: number, dcol: number, dz?: number) {
    this.id = id;
    this.ang = ang;
    this.drow = drow;
    this.dcol = dcol;
    this.dz = dz;
    Direction.directions[id] = this;
    Direction.ordered.push(this);
  }


  public static getAll(): Array<Direction> {
    return Direction.ordered;
  }


  public getAngle(): number {
    return this.ang;
  }


  public getAngleCos(): number {
    return Math.cos(this.ang * Math.PI / 180);
  }


  public getAngleSin(): number {
    return Math.sin(this.ang * Math.PI / 180);
  }


  public static get(id: string): Direction {
    return Direction.directions[id];
  }


  public getAnchorPointFractionX(): number {
    if (this.id === "U") {
      return 0.1;
    }
    if (this.id === "D") {
      return -0.1;
    }
    return this.getDeltaCol() / 2;
  }


  public getAnchorPointFractionY(): number {
    if (this.id === "U") {
      return -0.5;
    }
    if (this.id === "D") {
      return 0.5;
    }
    return this.getDeltaRow() / 2;
  }


  public getDeltaCol(): number {
    return this.dcol;
  }


  public getDeltaRow(): number {
    return this.drow;
  }


  public getDeltaZ(): number {
    return this.dz;
  }


  public getId(): string {
    return this.id;
  }


  public static nearest(bearing: number): Direction {
    const index: number = Math.floor((bearing + 22.5) / 45) % 8;
    const dir: Direction = Direction.ordered[index];
    // console.log(`nearest(${bearing}) => ${index} => ${dir}`);
    return dir;
  }

};



new Direction("N" ,   0, -1,  0,  0);
new Direction("NE",  45, -1,  1,  0);
new Direction("E" ,  90,  0,  1,  0);
new Direction("SE", 135,  1,  1,  0);
new Direction("S" , 180,  1,  0,  0);
new Direction("SW", 225,  1, -1,  0);
new Direction("W" , 270,  0, -1,  0);
new Direction("NW", 315, -1, -1,  0);
new Direction("U" ,  45,  0,  0,  1);
new Direction("D" , 225,  0,  0, -1);

