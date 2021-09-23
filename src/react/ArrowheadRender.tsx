import * as React from "react";
import Arrowhead from "../core/Arrowhead";

import styles from "./ArrowheadRender.css";

interface Props {
  arrowhead: Arrowhead;
}

const ArrowheadRender: React.FC<Props> = (props) => {
  if (props.arrowhead.getStyle() === "none") {
    return null;
  }

  const size = props.arrowhead.getSize();
  const angle = props.arrowhead.getAngle();
  const x_pos = props.arrowhead.getX();
  const y_pos = props.arrowhead.getY();
  const path = `M ${x_pos},${y_pos} l ${size / 3},${size} l ${
    (-size * 2) / 3
  },0 Z`;

  return (
    <g>
      <path
        className={styles.main}
        d={path}
        transform={`rotate(${angle} ${x_pos} ${y_pos})`}
      />
    </g>
  );
};

export default ArrowheadRender;
