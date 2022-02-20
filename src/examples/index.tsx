import * as React from "react";
import * as ReactDOM from "react-dom";
import { Route, Routes } from "react-router";
import { BrowserRouter, Link } from "react-router-dom";
import Basic from "./basic/app";
import CornerStitch from "./corner-stitch/app";
import LGOP from "./lgop/app/App";

const Menu: React.FC<{}> = () => {
  return (
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
  );
};

const App: React.FC<{}> = () => {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
      </nav>
      <Routes>
        <Route path="/basic" element={<Basic />} />
        <Route path="/corner-stitch" element={<CornerStitch />} />
        <Route path="/lgop" element={<LGOP />} />
        <Route path="*" element={<Menu />} />
      </Routes>
    </BrowserRouter>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));
