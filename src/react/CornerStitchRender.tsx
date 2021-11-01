import * as React from "react";
import TileRender from "./TileRender";
import CornerStitch from "../layout/CornerStitch";

interface Props {
  cs: CornerStitch;
}

const Main: React.FC<Props> = (props) => {
  const [count, setCount] = React.useState<number>(1);
  const blocks = [];
  props.cs.forEachTile((tile) => {
    blocks.push(
      <TileRender tile={tile} key={tile.getName()} />
    );
  });
  const width = props.cs.getArea().getBottomRight().getX() - props.cs.getArea().getTopLeft().getX();
  const height = props.cs.getArea().getBottomRight().getY() - props.cs.getArea().getTopLeft().getY();
  return (
    <svg
      width={width}
      height={height}
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      {blocks}
    </svg>
  );
};

export default Main;
