import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";

// ** import third party
import { ApolloProvider } from "@apollo/client";

// ** import components
import { router } from "./routes/router.jsx";
import client from "./apolloClient.js";

// ** import apis
import { AuthProvider } from "./context/authContext.jsx";

// ** import css
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <ApolloProvider client={client}>
      {/* <BrowserRouter> */}
      <React.StrictMode>
        <RouterProvider router={router} />
      </React.StrictMode>
      {/* </BrowserRouter> */}
    </ApolloProvider>
  </AuthProvider>
);
