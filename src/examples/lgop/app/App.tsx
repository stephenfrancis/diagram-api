import * as React from "react";
import * as ReactDOM from "react-dom";
import Doc from "./Doc";

interface Props {}

const INITIAL_HASH = "README.md";

const App: React.FC<Props> = (props) => {
  const [hash, setHash] = React.useState<string>(INITIAL_HASH);

  React.useEffect(() => {
    const onHashChange = () => {
      const url = new URL(window.location.href);
      if (url.hash) {
        setHash(url.hash.substr(1));
      } else {
        setHash(INITIAL_HASH);
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  return (
    <div>
      <Doc doc_id={hash} />
    </div>
  );
};

ReactDOM.render(<App />, window.document.getElementById("app"));
