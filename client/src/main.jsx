import { ApolloProvider } from "@apollo/client";
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import client from "./apolloClient.js";
import "./index.css";
import { AuthProvider } from "./context/authContext.jsx";
import { router } from "./routes/router.jsx";

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
