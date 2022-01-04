import * as React from "react";
import TileRender from "./TileRender";
import CornerStitch from "../layout/CornerStitch";

import styles from "./BlockRender.css";

interface Props {
  addBlock: (left: number, top: number, width: number, height: number, label: string) => void;
  cs: CornerStitch;
}

const SCALE_X = 5;
const SCALE_Y = 5;

const Main: React.FC<Props> = (props) => {
  const [count, setCount] = React.useState<number>(1);
  const svg_ref = React.useRef<SVGSVGElement>();
  const blocks = [];
  props.cs.forEachTile((tile) => {
    blocks.push(
      <TileRender tile={tile} key={tile.getName()} />
    );
  });
  const width = props.cs.getArea().getBottomRight().getX();
  const height = props.cs.getArea().getBottomRight().getY();

  const redraw = () => {
    setCount(c => c + 1);
  }

  return (
    <svg
      width={width * SCALE_X}
      height={height * SCALE_Y}
      viewBox={`0 0 ${width} ${height}`}
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.svg}
      ref={svg_ref}
    >
      {blocks}
      <AddBlock addBlock={props.addBlock} redraw={redraw} svg_ref={svg_ref} />
    </svg>
  );
};

export default Main;

interface AddBlockProps {
  addBlock: (left: number, top: number, width: number, height: number, label: string) => void;
  redraw: () => void;
  svg_ref: React.MutableRefObject<SVGSVGElement>;
}

interface Points {
  downX: number;
  downY: number;
  moveX: number;
  moveY: number;
  pointX: number;
  pointY: number;
}

const AddBlock: React.FC<AddBlockProps> = (props) => {
  const [ click, setClick ] = React.useState<number>(0);
  const [letter, setLetter] = React.useState<number>(65);
  const points = React.useRef<Points>({
    downX: null,
    downY: null,
    moveX: null,
    moveY: null,
    pointX: null,
    pointY: null,
  });
  const getCoords = (): [number, number, number, number] => {
    return [
      Math.min(points.current.downX, points.current.pointX),
      Math.min(points.current.downY, points.current.pointY),
      Math.abs(points.current.pointX - points.current.downX),
      Math.abs(points.current.pointY - points.current.downY),
    ]
  }

  React.useEffect(() => {
    const mouseDown = (event: MouseEvent) => {
      const svg_rect = props.svg_ref.current.getBoundingClientRect();
      if (event.clientX >= svg_rect.x && event.clientX <= svg_rect.right && event.clientY >= svg_rect.y && event.clientY <= svg_rect.bottom) {
        points.current.downX = points.current.pointX;
        points.current.downY = points.current.pointY;
      }
    };
    window.addEventListener("mousedown", mouseDown);

    const mouseMove = (event: MouseEvent) => {
      const svg_rect = props.svg_ref.current.getBoundingClientRect();
      points.current.pointX = Math.round((event.clientX - svg_rect.x) / SCALE_X);
      points.current.pointY = Math.round((event.clientY - svg_rect.y) / SCALE_Y);
      setClick(c => c + 1);
    }
    window.addEventListener("mousemove", mouseMove);

    const mouseUp = () => {
      console.log(`mouseup ${JSON.stringify(points.current)}`);
      if (points.current.downX !== null) {
        try {
          points.current.moveX = points.current.pointX;
          points.current.moveY = points.current.pointY;
          props.addBlock(...getCoords(), `block ${String.fromCharCode(letter)}`);
          props.redraw();
        } catch (e) {
          console.error(e);
          alert(e.toString());
        }
      }
      points.current.downX = null;
      points.current.moveX = null;
      setClick(0);
      setLetter(letter + 1);
    }
    window.addEventListener("mouseup", mouseUp);
    const keyUp = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        points.current.downX = null;
        points.current.moveX = null;
        setClick(0);
      }
    }
    window.addEventListener("keyup", keyUp)
    return () => {
      window.removeEventListener("mousedown", mouseDown);
      window.removeEventListener("mouseup", mouseUp);
      window.removeEventListener("mousemove", mouseMove);
      window.removeEventListener("keyup", keyUp)
    }
  }, [ letter ]);
    const coords = getCoords();
    return (
      <>
        {points.current.downX !== null && <rect
          className={styles.select}
          x={coords[0]}
          y={coords[1]}
          width={coords[2]}
          height={coords[3]}
        />}
        <text x={5} y={190}>{points.current.pointX}, {points.current.pointY}</text>
      </>
    )
}
