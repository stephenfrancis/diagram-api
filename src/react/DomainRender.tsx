import * as React from "react";
import BlockRender from "./BlockRender";
import Domain from "../core/Domain";

interface Props {
  domain: Domain;
}

const Main: React.FC<Props> = (props) => {
  const [count, setCount] = React.useState<number>(1);
  const blocks = [];
  const redraw = () => {
    setCount((c) => c + 1);
  };
  props.domain.forEachBlock((block) => {
    blocks.push(
      <BlockRender block={block} key={block.getName()} redraw={redraw} />
    );
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
