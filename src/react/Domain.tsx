import * as React from "react";
import { BlockRect, BlockText } from "./Block";
import Domain from "../core/Domain";

interface Props {
  domain: Domain;
}

const Main: React.FC<Props> = (props) => {
  const block_rects = [];
  const block_texts = [];
  props.domain.forEachBlock((block) => {
    block_rects.push(<BlockRect block={block} key={block.getName()} />);
    block_texts.push(<BlockText block={block} key={block.getName()} />);
  });
  return (
    <svg
      width={1000}
      height={600}
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        style={{
          stroke: "green",
          strokeWidth: 1,
          fill: "#bbb",
        }}
      >
        {block_rects}
      </g>
      <g
        style={{
          stroke: "transparent",
          fill: "green",
        }}
      >
        {block_texts}
      </g>
    </svg>
  );
};

export default Main;
