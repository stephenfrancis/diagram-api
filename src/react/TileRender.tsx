import * as React from "react";
import { Tile } from "../layout/CornerStitch";

import styles from "./BlockRender.css";

const PADDING = 1;

interface Props {
  tile: Tile;
}

const TileRender: React.FC<Props> = (props) => {
  const divRef = React.useRef<HTMLDivElement>(null);
  // const [height, setHeight] = React.useState<number>(24);
  const area = props.tile.getArea();
  const height = area.getHeight();
  const width = area.getWidth();

  console.log(`rerender ${props.tile.toString()} height ${height}`)

  return (
    <g>
      <rect
        className={styles.main}
        x={area.getMinX()}
        y={area.getMinY()}
        width={width}
        height={height}
      />
      <foreignObject
        x={area.getMinX() + PADDING}
        y={area.getMinY() + PADDING}
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
