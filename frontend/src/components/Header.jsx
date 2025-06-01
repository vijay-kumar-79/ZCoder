import axios from "axios";
import { NavLink } from "react-router-dom"; 
import { useNavigate } from "react-router-dom";
import "./Header.css";

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

    return (
        <header className="navbar">
            <nav>
                <ul className="nav-links">
                    <li>
                        <NavLink to="/dashboard" >Dashboard</NavLink>
                    </li>
                    {/* <li>
                        <NavLink to="/bookmarkedproblems" >Bookmarked Problems</NavLink>
                    </li>
                    <li>
                        <NavLink to="/myproblems" >My Problems</NavLink>
                    </li> */}
                    <li>
                        <NavLink to="/rooms" >Rooms</NavLink>
                    </li>
                    <li>
                        <NavLink to="/calendar" >Calender</NavLink>
                    </li>
                    {/* <li>
                        <NavLink to={`/myprofile/${userId}`} >My Profile</NavLink>
                    </li> */}
                    {/* <li>
                        <NavLink to="/blogs" >Blogs</NavLink>
                    </li>
                    <li>
                        <NavLink to="/collaborators" >Hire Collaborator </NavLink>
                    </li> */}
                    <li>
                        <NavLink to="/askAi" >Ask AI </NavLink>
                    </li>
                    {/* <li>
                        <NavLink to="/importantlinks" >Important Links </NavLink>
                    </li> */}
                </ul>
            </nav>
            
            {/* <button className="logout-button" onClick={handleClick}>
                Log Out
            </button> */}
        </header>
    );
}

export default Header;
