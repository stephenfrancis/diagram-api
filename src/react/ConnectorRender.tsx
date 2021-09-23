import * as React from "react";
import Connector from "../core/Connector";
import ArrowheadRender from "./ArrowheadRender";

import styles from "./ConnectorRender.css";

interface Props {
  connector: Connector;
}

const ConnectorRender: React.FC<Props> = (props) => {
  const arrowhead_sta = props.connector.getArrowheadStart();
  const arrowhead_end = props.connector.getArrowheadEnd();
  const lines = props.connector.getLineSegments();
  const path =
    `M ${lines[0].getFrom().getX()},${lines[0].getFrom().getY()} ` +
    lines
      .map((line) => `L ${line.getTo().getX()},${line.getTo().getY()}`)
      .join(" ");

  return (
    <g>
      {arrowhead_sta && <ArrowheadRender arrowhead={arrowhead_sta} />}
      <path className={styles.main} d={path} />
      {arrowhead_end && <ArrowheadRender arrowhead={arrowhead_end} />}
    </g>
  );
};

export default ConnectorRender;
