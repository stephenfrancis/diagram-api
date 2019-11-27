
import Element from "./Element";
import Rectangle from "./Rectangle";
import StyleSet from "./StyleSet";
import Text from "./Text";
import * as Types from "./Types";

export default class TextBox extends Element {
  private padding: number[];
  private text: string;
  private width: number;
  private word_wrap: boolean;

  constructor(styleset: StyleSet, x_pos: number, y_pos: number, text: string, width?: number) {
    super(styleset, x_pos, y_pos);
    this.text = text;
    this.padding = [ 5, 5, 5, 5, ];
    this.width = width || 150;
    this.word_wrap = true;
  }


  public getExtremes(): Types.Extremes {
    const width: number = this.getWidth();
    const height: number = this.getHeight();
    return {
      x_min: this.getX() - (width / 2),
      y_min: this.getY() - (height / 2),
      x_max: this.getX() + (width / 2),
      y_max: this.getY() + (height / 2),
    };
  }


  public getMarkup(): string {
    let out = "";
    const text_parts: string[] = this.getTextParts();
    const width: number = this.getWidth();
    const height: number = this.getHeight(text_parts.length);
    const rect = new Rectangle(this.getStyleSet(), this.getX(), this.getY(), width, height);
    rect.setStyleSet(this.getStyleSet());
    out += rect.getMarkup();
    for (let i = 0; i < text_parts.length; i += 1) {
      const est_text_width = Text.estimateTextWidth(text_parts[i], this.getStyleSet().getFontSize());
      const elem = new Text(this.getStyleSet(),
        this.getX() + this.padding[3] - (width / 2) + (est_text_width / 2),
        this.getY() + this.padding[0] - (height / 2) + (this.getStyleSet().getLineHeight() * (i + 1.5)),
        text_parts[i]);
      elem.setStyleSet(this.getStyleSet());
      out += elem.getMarkup();
    }
    return out;
  }


  public getHeight(lines?: number): number {
    if (typeof lines !== "number") {
      const text_parts: string[] = this.getTextParts();
      lines = text_parts.length;
    }
    return (lines * this.getStyleSet().getLineHeight()) + this.padding[0] + this.padding[2];
  }


  public getPadding(): number[] {
    return this.padding;
  }


  public getText(): string {
    return this.text;
  }


  private getTextParts(): string[] {
    return Text.chopTextToFitWidth(this.text,
      this.getStyleSet().getFontSize(),
      this.getWidth() - this.padding[1] - this.padding[3],
      this.word_wrap);
  }


  public getWidth(): number {
    return this.width;
  }


  public getWordWrap(): boolean {
    return this.word_wrap;
  }


  public setPadding(arg: number[]): void {
    if (arg.length !== 4) {
      throw new Error("must be a 4-element number array");
    }
    this.padding = arg;
  }


  public setText(arg: string): void {
    this.text = arg;
  }


  public setWidth(arg: number): void {
    this.width = arg;
  }


  public setWordWrap(arg: boolean): void {
    this.word_wrap = arg;
  }

}
