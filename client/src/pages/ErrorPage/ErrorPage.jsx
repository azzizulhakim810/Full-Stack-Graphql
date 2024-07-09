
import { Link } from 'react-router-dom';

const ErrorPage = () => {
  return (
    <div>
      <div className="hero min-h-screen bg-base-200">
  <div className="hero-content text-center">
    <div className="max-w-md">
      <h1 className="text-5xl font-bold">404! Not Found ☹</h1>
      <h1 className="text-3xl font-medium py-8">Opps! You have lost</h1>
      <Link to='/'>
      <button className="btn bg-red-600 text-white px-10 hover:bg-red-800">
        HOME
      </button>
      </Link>
    </div>
  </div>
</div>
    </div>
  );
};

export default ErrorPage;