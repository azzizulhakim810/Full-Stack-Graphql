import { createBrowserRouter } from "react-router-dom";

// ** import components
import Root from "../layout/Root";
import PrivateRoute from "./PrivateRoute/PrivateRoute";
import ErrorPage from "../pages/ErrorPage/ErrorPage";
import Homepage from "../pages/Homepage/Homepage";
import Register from "../pages/Register/Register";
import Login from "../pages/Login/Login";
import DisplayData from "../pages/DisplayAllData/DisplayData";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root></Root>,
    errorElement: <ErrorPage></ErrorPage>,
    children: [
      {
        path: "/",
        element: <Homepage />,
      },

      {
        path: "/displayData",
        element: (
          <PrivateRoute>
            <DisplayData />
          </PrivateRoute>
        ),
      },

      {
        path: "/register",
        element: <Register />,
      },

      {
        path: "/login",
        element: <Login />,
      },
    ],
  },
]);
