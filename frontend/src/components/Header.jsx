import axios from "axios";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./Header.css";
import Logo from '../assets/logo.png'

function Header() {
  const navigate = useNavigate();
  // const userId = localStorage.getItem("userId")

  // async function handleClick() {
  //     try {
  //         await axios.post(`https://z-coder.vercel.app/logout`, {}, { withCredentials: true });
  //         localStorage.removeItem("token");
  //         localStorage.removeItem("userId");
  //         navigate("/");
  //     } catch (error) {
  //         console.log(error);
  //         console.log("error while logging out");
  //     }
  // }
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <nav>
        <img src={Logo} alt="Logo" className="nav-logo" />
        <ul className="nav-links">
          <li>
            <NavLink to="/">Home</NavLink>
          </li>
          <li>
            <NavLink to="/dashboard">Dashboard</NavLink>
          </li>
          <li>
            <NavLink to="/rooms">Rooms</NavLink>
          </li>
          <li>
            <NavLink to="/calendar">Calender</NavLink>
          </li>
          <li>
            <NavLink to="/askAi">Ask AI </NavLink>
          </li>
          <li className="logout-btn">
            <NavLink onClick={handleLogout}>Logout </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
