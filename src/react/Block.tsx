import * as React from "react";
import Block from "../core/Block";

interface Props {
  block: Block;
}

export const BlockRect: React.FC<Props> = (props) => {
  const centre = props.block.getCentre();
  const width = props.block.getWidth();
  const height = props.block.getHeight();
  const link = props.block.getLink();
  const render = () => (
    <rect
      x={centre.getX() - width / 2}
      y={centre.getY() - height / 2}
      width={width}
      height={height}
    />
  );
  return link ? <a href={link}>{render()}</a> : render();
};

export const BlockText: React.FC<Props> = (props) => {
  const centre = props.block.getCentre();
  return (
    <text x={centre.getX()} y={centre.getY()} textAnchor="middle">
      {props.block.getName()}
    </text>
  );
};
