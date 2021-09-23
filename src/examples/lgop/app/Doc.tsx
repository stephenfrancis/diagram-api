import * as React from "react";

import Domain, { Phase } from "../../../core/Domain";
import Map from "./Map";
import MapLoader from "../../../loaders/MapLoader";
import BellmanFord from "../../../layout/BellmanFord";
import LayoutConnectors from "../../../layout/LayoutConnectors";
import Scale from "../../../layout/Scale";

interface Props {
  doc_id: string;
}

const Doc: React.FC<Props> = (props) => {
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

        const s: Scale = new Scale("svg");
        s.apply(d);

        d.setPhase(Phase.ConnectorLayout);
        const layout = new LayoutConnectors(4);
        layout.apply(d);

        // const f: FinishConnectors = new FinishConnectors();
        // f.layoutDomain(d);

        d.setPhase(Phase.Finalized);

        setDomain(d);
        setError(undefined);
      })
      .catch((error) => {
        setDomain(undefined);
        setError(error);
      });
  }, [props.doc_id]);

  return (
    <div>
      {domain && <Map domain={domain} />}
      {error && <span>{error}</span>}
      {!domain && !error && <div>Loading...</div>}
    </div>
  );
};

export default Doc;
