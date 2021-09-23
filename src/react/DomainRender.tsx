import * as React from "react";
import BlockRender from "./BlockRender";
import Domain from "../core/Domain";

interface Props {
  domain: Domain;
}

const Main: React.FC<Props> = (props) => {
  const blocks = [];
  props.domain.forEachBlock((block) => {
    blocks.push(<BlockRender block={block} key={block.getName()} />);
  });
  return (
    <svg
      width={props.domain.getMaxX()}
      height={props.domain.getMaxY()}
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      {blocks}
    </svg>
  );
};

export default Main;
