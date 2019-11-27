
import Domain from "../core/Domain";
import ILayout from "./ILayout";
import Lee from "./Lee";
import SimpleConnectors from "./SimpleConnectors";


export default class LayoutConnectors implements ILayout {
  private lee: Lee;
  private simple_connectors: SimpleConnectors;

  constructor(sophistication: number) {
    if (sophistication < 1 || sophistication > 5 || !Number.isInteger(sophistication)) {
      throw new Error(`sophistication should be an integer between 1 and 5, you gave ${sophistication}`);
    }
    if (sophistication > 4) {
      this.lee = new Lee();
    } else {
      this.simple_connectors = new SimpleConnectors(sophistication);
    }
  }


  public beginDomain(Domain: Domain): void {
    if (this.lee) {
      this.lee.beginDomain(Domain);
    } else {
      this.simple_connectors.layoutDomain(Domain);
    }
  }


  public iterate(): boolean {
    if (this.lee) {
      return this.lee.iterate();
    }
    return false;
  }

}
