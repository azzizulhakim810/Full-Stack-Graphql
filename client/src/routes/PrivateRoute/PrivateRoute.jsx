import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/authContext";

// eslint-disable-next-line react/prop-types
const PrivateRoute = ({ children }) => {
  const { customer } = useContext(AuthContext);

  const location = useLocation();

  if (customer) {
    return children;
  }
  return <Navigate state={location.pathname} to="/login"></Navigate>;
};

export default PrivateRoute;
