import { useNavigate } from "react-router-dom";
import { Appdata } from "../context/Appcontext";

const Home = () => {
  const { Logout } = Appdata();
  const navigate = useNavigate();

  const handleLogout = () => {
    Logout();              // clear auth state, tokens, etc.
    navigate("/login");    // redirect after logout
  };

  return (
    <div className="flex w-[100px] m-auto mt-40">
      <button
        className="bg-red-500 rounded-md text-white p-4"
        onClick={handleLogout}
      >
        LogOut
      </button>
    </div>
  );
};

export default Home;
