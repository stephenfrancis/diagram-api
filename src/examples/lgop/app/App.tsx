import * as React from "react";
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
      <div>
        <a href="#cleveland.md">cleveland</a> <a href="#mars.md">mars</a>{" "}
        <a href="#phobos.md">phobos</a> <a href="#sandusky.md">sandusky</a>{" "}
        <a href="#test.md">test</a> <a href="#venus.md">venus</a>
      </div>
      <Doc doc_id={hash} />
    </div>
  );
};

export default App;
