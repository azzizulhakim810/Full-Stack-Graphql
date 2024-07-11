import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";

// ** import apis
import { AuthContext } from "../context/authContext";

const Navbar = () => {
  const { customer, logout } = useContext(AuthContext);

  let navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  console.log(customer);

  return (
    <div>
      <div className="navbar bg-base-100">
        <div className="navbar-start">
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h8m-8 6h16"
                />
              </svg>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
            >
              <li>
                <a>Item 1</a>
              </li>
              <li>
                <a>Parent</a>
                <ul className="p-2">
                  <li>
                    <a>Submenu 1</a>
                  </li>
                  <li>
                    <a>Submenu 2</a>
                  </li>
                </ul>
              </li>
              <li>
                <a>Item 3</a>
              </li>
            </ul>
          </div>
          <a className="btn btn-ghost text-xl">
            <Link to="/">GraphQL</Link>
          </a>
        </div>

        {/* Register/Login Button  */}
        <div className="navbar-end gap-5">
          <Link
            to="/displayData"
            className="btn bg-white text-black hover:bg-gray-300 "
          >
            All Data
          </Link>

          {!customer ? (
            <Link
              to="/register"
              className="btn bg-white text-black hover:bg-gray-300 "
            >
              Register
            </Link>
          ) : (
            ""
          )}

          {customer ? (
            <Link
              onClick={onLogout}
              to="/login"
              className="btn bg-white text-black hover:bg-gray-300 "
            >
              Logout
            </Link>
          ) : (
            <Link
              to="/login"
              className="btn bg-white text-black hover:bg-gray-300 "
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;