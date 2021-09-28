import * as React from "react";
import Domain, { Phase } from "../../core/Domain";
import DomainRender from "../../react/DomainRender";
import FinishConnectors from "../../layout/FinishConnectors";
import LayoutConnectors from "../../layout/LayoutConnectors";
import Scale from "../../layout/Scale";

interface Props {}

const App: React.FC<Props> = (props) => {
  const [sophis, setSophis] = React.useState<number>(1);
  const [domain, setDomain] = React.useState<Domain>(null);
  React.useEffect(() => {
    console.log(`sophis: ${sophis}`);
    const d = new Domain();

    const b1 = d.addBlock(
      "Come, you spirits That tend on mortal thoughts, unsex me here And fill me from the crown to the toe top-full Of direst cruelty!",
      sophis < 5 ? 100 : 1,
      sophis < 5 ? 50 : 1
    );
    const b2 = d.addBlock(
      "Make thick my blood, Stop up the access and passage to remorse,",
      sophis < 5 ? 250 : 2,
      sophis < 5 ? 150 : 2
    );
    const b3 = d.addBlock(
      "That no compunctious visitings of nature Shake my fell purpose, nor keep peace between The effect and it!",
      sophis < 5 ? 400 : 3,
      sophis < 5 ? 250 : 3
    );
    const c = b1.addConnector(b3, "one-way", "E", "N");
    // b1.setPadding([ 0, 0, 0, 0, ]);
    // c.addPathPoint(250,  50);
    // c.addPathPoint(250, 150 - (b2.getHeight() / 2));

    d.setPhase(Phase.ConnectorLayout);

    const layout = new LayoutConnectors(sophis);
    layout.apply(d);

    if (sophis === 5) {
      const s = new Scale("svg");
      s.apply(d);

      const f = new FinishConnectors();
      f.apply(d);
    }
    d.setPhase(Phase.Finalized);

    setDomain(d);
  }, [sophis]);

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
      <div>{domain && <DomainRender domain={domain} />}</div>
    </div>
  );
};

export default App;
