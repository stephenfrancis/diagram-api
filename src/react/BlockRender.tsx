import * as React from "react";
import Block from "../core/Block";
import ConnectorRender from "./ConnectorRender";

import styles from "./BlockRender.css";

const PADDING = 5;

interface Props {
  block: Block;
  redraw?: () => void;
}

const BlockRender: React.FC<Props> = (props) => {
  const divRef = React.useRef<HTMLDivElement>(null);
  // const [height, setHeight] = React.useState<number>(24);
  const height = props.block.getHeight();
  const centre = props.block.getCentre();
  const width = props.block.getWidth();
  // const height = props.block.getHeight();
  const link = props.block.getLink();
  const connectors = [];
  props.block.forEachConnector((connector) => {
    connectors.push(
      <ConnectorRender key={connector.toString()} connector={connector} />
    );
  });

  React.useEffect(() => {
    props.block.setHeight(divRef.current.offsetHeight + PADDING * 2 + 1);
    props.redraw();
  }, [props.block.getName()]);

  const render = () => (
    <g>
      <rect
        className={styles.main}
        x={centre.getX() - width / 2}
        y={centre.getY() - 12}
        width={width}
        height={height}
      />
      <foreignObject
        x={centre.getX() + PADDING - width / 2}
        y={centre.getY() + PADDING - 12}
        width={width - 2 * PADDING}
        height={height - 2 * PADDING}
        className={styles.forobj}
      >
        <div ref={divRef} className={styles.text}>
          {props.block.getName()}
        </div>
      </foreignObject>
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
