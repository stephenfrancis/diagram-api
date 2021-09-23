import * as React from "react";
import * as ReactDOM from "react-dom";
import Doc from "./Doc";

interface Props {}

const getHashFromURL = (url_text) => {
  const url = new URL(window.location.href);
  return url.hash ? url.hash.substr(1) : "README.md";
};

const App: React.FC<Props> = (props) => {
  const [hash, setHash] = React.useState<string>(
    getHashFromURL(window.location.href)
  );

  React.useEffect(() => {
    const onHashChange = () => {
      setHash(getHashFromURL(window.location.href));
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
