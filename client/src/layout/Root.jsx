import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
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
