
import Domain from "../core/Domain";


export default interface Layout {

  beginDomain(domain: Domain): void;

  iterate(): boolean;

}