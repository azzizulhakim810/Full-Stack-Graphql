import { Outlet } from "react-router-dom";

// ** import components
import Navbar from "../components/Navbar";

// ** import css
import "../App.css";

const Root = () => {
  return (
    <div className="App">
      <Navbar />
      <Outlet></Outlet>
    </div>
  );
};

export default Root;
