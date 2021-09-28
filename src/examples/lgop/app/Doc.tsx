import * as React from "react";

import Domain, { Phase } from "../../../core/Domain";
import Map from "./Map";
import MapLoader from "../../../loaders/MapLoader";
import BellmanFord from "../../../layout/BellmanFord";
import FinishConnectors from "../../../layout/FinishConnectors";
import LayoutConnectors from "../../../layout/LayoutConnectors";
import OverlapFixer from "../../../layout/OverlapFixer";
import Scale from "../../../layout/Scale";

interface Props {
  doc_id: string;
}

const Doc: React.FC<Props> = (props) => {
  const [sophis, setSophis] = React.useState<number>(1);
  const [domain, setDomain] = React.useState<Domain>(undefined);
  const [error, setError] = React.useState<string>(undefined);
  React.useEffect(() => {
    fetch(props.doc_id)
      .then((resp) => {
        return resp.text();
      })
      .then((content) => {
        const d = new Domain();
        const m = new MapLoader(d);
        m.parseContent(content);

        d.setPhase(Phase.BlockLayout);

        const b = new BellmanFord();
        b.apply(d);

        const o = new OverlapFixer();
        o.apply(d);

        if (sophis > 1 && sophis < 5) {
          const s = new Scale("svg");
          s.apply(d);
        }

        d.setPhase(Phase.ConnectorLayout);
        const layout = new LayoutConnectors(sophis);
        layout.apply(d);

        if (sophis === 1 || sophis === 5) {
          const s = new Scale("svg");
          s.apply(d);
        }
        if (sophis === 5) {
          const f = new FinishConnectors();
          f.apply(d);
        }

        d.setPhase(Phase.Finalized);

        setDomain(d);
        setError(undefined);
      })
      .catch((error) => {
        setDomain(undefined);
        setError(error);
      });
  }, [props.doc_id, sophis]);

  const radioChange = (level: number) => {
    setSophis(level);
  };

  const renderRadio = (level: number) => {
    return (
      <>
        <input
          checked={level === sophis}
          onChange={radioChange.bind(null, level)}
          type="radio"
          id={String(level)}
          name="sophis"
        />
        <label htmlFor={String(level)}>{level}</label>
      </>
    );
  };

  return (
    <div>
      <form>
        Connector Layout Sophistication Level:
        {renderRadio(1)}
        {renderRadio(2)}
        {renderRadio(3)}
        {renderRadio(4)}
        {renderRadio(5)}
      </form>
      {domain && <Map domain={domain} />}
      {error && <span>{error}</span>}
      {!domain && !error && <div>Loading...</div>}
    </div>
  );
};

export default Doc;
