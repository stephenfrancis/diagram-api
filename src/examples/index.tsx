import * as React from "react";
import * as ReactDOM from "react-dom";
import { Route, Switch } from "react-router";
import { BrowserRouter, Link } from "react-router-dom";
import Basic from "./basic/app";
import CornerStitch from "./corner-stitch/app";
import LGOP from "./lgop/app/App";

const App: React.FC<{}> = () => {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
      </nav>
      <Switch>
        <Route path="/basic">
          <Basic />
        </Route>
        <Route path="/corner-stitch">
          <CornerStitch />
        </Route>
        <Route path="/lgop">
          <LGOP />
        </Route>
        <Route>
          <ul>
            <li>
              <Link to="/basic">Basic</Link>
            </li>
            <li>
              <Link to="/corner-stitch">Corner Stitch</Link>
            </li>
            <li>
              <Link to="/lgop">LGOP</Link>
            </li>
          </ul>
        </Route>
      </Switch>
    </BrowserRouter>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));
