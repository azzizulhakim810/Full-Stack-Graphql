import { useMutation } from "@apollo/client";
import { gql } from "graphql-tag";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import { useForm } from "../../utility/hooks";

const LOGIN_USER = gql`
  mutation LoginCustomer($loginInput: LoginInput) {
    loginCustomer(loginInput: $loginInput) {
      id
      username
      email
      token
    }
  }
`;

const Login = (props) => {
  const context = useContext(AuthContext);
  let navigate = useNavigate();
  const [errors, setErrors] = useState([]);
  console.log(errors[0]);
  function loginCustomerCallback() {
    loginCustomer();
  }

  const { onChange, onSubmit, values } = useForm(loginCustomerCallback, {
    email: " ",
    password: " ",
  });

  const [loginCustomer, { loading }] = useMutation(LOGIN_USER, {
    update(proxy, { data: { loginCustomer: CustomerData } }) {
      context.login(CustomerData);
      navigate("/");
    },

    onError({ graphQLErrors }) {
      setErrors(graphQLErrors);
    },
    variables: { loginInput: values },
  });

  return (
    <div>
      <h1 className="text-2xl mt-5">Login Your Account</h1>
      {/* Form  */}
      <div className="w-6/12 mx-auto mt-5 mb-10 bg-slate-700 p-16 rounded">
        {/* Email  */}
        <label className="input input-bordered flex items-center gap-2 mb-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="h-4 w-4 opacity-70"
          >
            <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
            <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
          </svg>
          <input
            type="text"
            className="grow"
            name="email"
            placeholder="Email"
            onChange={onChange}
          />
        </label>
        {/* Password  */}
        <label className="input input-bordered flex items-center gap-2 mb-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="h-4 w-4 opacity-70"
          >
            <path
              fillRule="evenodd"
              d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="password"
            className="grow"
            name="password"
            onChange={onChange}
          />
        </label>

        {/* {<p className="text-red-500">{errors[0]?.message}</p>} */}

        {errors.map((i, error) => console.log({ error }))}

        <p className="text-red-600">{errors[0]?.message}</p>

        <button onClick={onSubmit} className="btn mt-3">
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
