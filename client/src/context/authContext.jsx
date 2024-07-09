import { useReducer, createContext } from "react";
import { jwtDecode } from "jwt-decode";

const initialState = {
  customer: null,
};

if (localStorage.getItem("token")) {
  const decodedToken = jwtDecode(localStorage.getItem("token"));

  if (decodedToken.exp * 1000 < Date.now()) {
    localStorage.removeItem("token");
  } else {
    initialState.customer = decodedToken;
  }
}

const AuthContext = createContext({
  customer: null,
  login: (customerData) => {},
  logout: () => {},
});

function authReducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        customer: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        customer: null,
      };
    default:
      return state;
  }
}

function AuthProvider(props) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = (customerData) => {
    localStorage.setItem("token", customerData.token);
    dispatch({
      type: "LOGIN",
      payload: customerData,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    dispatch({
      type: "LOGOUT",
    });
  };

  return (
    <AuthContext.Provider
      value={{ customer: state.customer, login, logout }}
      {...props}
    ></AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
