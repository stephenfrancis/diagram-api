import * as React from "react";
import Block from "../core/Block";
import ConnectorRender from "./ConnectorRender";

import styles from "./BlockRender.css";

interface Props {
  block: Block;
}

const BlockRender: React.FC<Props> = (props) => {
  const centre = props.block.getCentre();
  const width = props.block.getWidth();
  const height = props.block.getHeight();
  const link = props.block.getLink();
  const connectors = [];
  props.block.forEachConnector((connector) => {
    connectors.push(
      <ConnectorRender key={connector.toString()} connector={connector} />
    );
  });
  const render = () => (
    <g>
      <rect
        className={styles.main}
        x={centre.getX() - width / 2}
        y={centre.getY() - height / 2}
        width={width}
        height={height}
      />
      <text
        x={centre.getX()}
        y={centre.getY() + 5}
        textAnchor="middle"
        className={styles.text}
      >
        {props.block.getName()}
      </text>
    </g>
  );
  return (
    <>
      {link ? <a href={link}>{render()}</a> : render()}
      {connectors}
    </>
  );
};

export default BlockRender;
