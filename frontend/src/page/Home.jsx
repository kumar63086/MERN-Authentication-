import { Link, useNavigate } from "react-router-dom";
import { Appdata } from "../context/Appcontext";

const Home = () => {
  const { Logout, user } = Appdata();
  const navigate = useNavigate();

  const handleLogout = () => {
    Logout();           // clear auth state, tokens, etc.
    navigate("/login"); // redirect after logout
  };

  return (
    <div className="flex gap-4 w-fit m-auto mt-40">
      <button
        className="bg-red-500 rounded-md text-white p-4"
        onClick={handleLogout}
      >
        LogOut
      </button>

      {user && user.role === "admin" && (
        <Link
          to="/dashboard"
          className="bg-purple-500 rounded-md text-white p-4"
        >
          Dashboard
        </Link>
      )}
    </div>
  );
};

export default Home;

