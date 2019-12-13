
import * as SVG from "svg-api";

export type ArrowheadStyle = "none" | "basic";

export default class Arrowhead {
  private angle: number;
  private size: number;
  private style: ArrowheadStyle;
  private x_pos: number;
  private y_pos: number;

  constructor(x_pos: number, y_pos: number, angle: number, size?: number, style?: ArrowheadStyle) {
    this.angle = angle;
    this.size  = size || 10;
    this.style = style;
    this.x_pos = x_pos;
    this.y_pos = y_pos;
  }

  /*
  public getExtremes(): SVG.Extremes {
    return {
      x_min: this.getX(),
      y_min: this.getY(),
      x_max: this.getX(),
      y_max: this.getY(),
    };
  }
*/


  public copy(): Arrowhead {
    return new Arrowhead(this.x_pos, this.y_pos, this.angle, this.size, this.style);
  }


  public draw(group: SVG.Group, styleset?: SVG.StyleSet): SVG.Group {
    const new_group = group.addGroup(styleset);
    const path = new_group.addPath(this.getX(), this.getY());
    path.lineToRelative( -this.size,   this.size     / 3);
    path.lineToRelative(          0, - this.size * 2 / 3);
    path.closePath();
    path.getTransform().addRotate(this.angle, this.getX(), this.getY());
    return new_group;
  }


  public getAngle(): number {
    return this.angle;
  }


  public getSize(): number {
    return this.size;
  }


  public getStyle(): ArrowheadStyle {
    return this.style;
  }


  public getX(): number {
    return this.x_pos;
  }


  public getY(): number {
    return this.y_pos;
  }


  public setAngle(arg: number): void {
    this.angle = arg;
  }


  public setSize(arg: number): void {
    this.size = arg;
  }


  public setStyle(arg: ArrowheadStyle): void {
    this.style = arg;
  }


  public setX(arg: number): void {
    this.x_pos = arg;
  }


  public setY(arg: number): void {
    this.y_pos = arg;
  }

}
