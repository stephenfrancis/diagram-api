import * as React from "react";
import Domain from "../../../core/Domain";
import DrawDomain from "../../../react/DomainRender";

interface Props {
  domain: Domain;
}

const Map: React.FC<Props> = (props) => {
  return (
    <div>
      <h1>{props.domain.getTitle()}</h1>
      <div>
        <DrawDomain domain={props.domain} />
      </div>
    </div>
  );
};

export default Map;
