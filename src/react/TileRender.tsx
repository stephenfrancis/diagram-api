import * as React from "react";
import { Tile } from "../layout/CornerStitch";

import styles from "./BlockRender.css";

const PADDING = 5;

interface Props {
  tile: Tile;
}

const TileRender: React.FC<Props> = (props) => {
  const divRef = React.useRef<HTMLDivElement>(null);
  // const [height, setHeight] = React.useState<number>(24);
  const area = props.tile.getArea();
  const height = area.getBottomRight().getY() - area.getTopLeft().getY();
  const width = area.getBottomRight().getX() - area.getTopLeft().getX();

  console.log(`rerender ${props.tile.toString()} height ${height}`)

  return (
    <g>
      <rect
        className={styles.main}
        x={area.getTopLeft().getX()}
        y={area.getTopLeft().getY()}
        width={width}
        height={height}
      />
      <foreignObject
        x={area.getTopLeft().getX() + PADDING}
        y={area.getTopLeft().getY() + PADDING}
        width={width - 2 * PADDING}
        height={height - 2 * PADDING}
        className={styles.forobj}
      >
        <div ref={divRef} className={styles.text}>
          {props.tile.toString()}
        </div>
      </foreignObject>
    </g>
  );
};

export default TileRender;
