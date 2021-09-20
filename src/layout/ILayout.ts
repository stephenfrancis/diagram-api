import Domain from "../core/Domain";

export interface IterativeLayout {
  begin(domain: Domain): void;

  iterate(): boolean;
}

export interface NonIterativeLayout {
  apply(domain: Domain): void;
}
