import React, { useState, useEffect } from "react";
// import { useEffect } from 'react-router-dom';
import "../styles/UserProfile.css";
import EditProfile from "../components/EditProfile";
import Toast from "../components/Toast";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    profilePicture: "",
    codeforcesHandle: "",
    codeforcesRating: "",
    leetcodeHandle: "",
    leetcodeRating: "",
    codechefHandle: "",
    codechefRating: "",
    programmingLanguages: [],
    skills: [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [cfInfo, setCfInfo] = useState(null);
  const [lcInfo, setLcInfo] = useState(null);
  const [ccInfo, setCcInfo] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
  };

  useEffect(() => {
    // Redirect to the login page if the user is not authenticated
    const jwtoken = localStorage.getItem("jwtoken");
    if (jwtoken === null || jwtoken === undefined) {
      navigate("/login");
    }
  }, [navigate]);
  const backend = process.env.REACT_APP_BACKEND_URL;

  // Fetch user data (replace with your actual API call)
  useEffect(() => {
    const fetchUserData = async () => {
      const jwtoken = localStorage.getItem("jwtoken");
      try {
        const res = await fetch(`${backend}/user/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtoken}`,
          },
        });
        const data = await res.json();
        // console.log(data);
        setUserData(data);
        if (data.codeforcesHandle) {
          fetchCodeforcesInfo(data.codeforcesHandle);
        }
        if (data.leetcodeHandle) {
          fetchLeetCodeInfo(data.leetcodeHandle);
        }
        if (data.codechefHandle) {
          fetchCodeChefInfo(data.codechefHandle);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, [backend]);

  // Fetch Codeforces info (handles array response)
  const fetchCodeforcesInfo = async (handle) => {
    try {
      const res = await fetch(
        `https://competeapi.vercel.app/user/codeforces/${handle}/`
      );
      const data = await res.json();
      // If data is an array, use first element; else use data itself
      const info = Array.isArray(data) ? data[0] : data;
      setCfInfo(info);
      // Optional: Also update codeforcesRating in userData if you want to store it
      // setUserData(prev => ({ ...prev, codeforcesRating: info?.rating ?? '' }));
    } catch (error) {
      console.error("Error fetching Codeforces info:", error);
      setCfInfo(null); // Clear on error
    }
  };

  // Fetch LeetCode info (problems solved + contest rating)
  const fetchLeetCodeInfo = async (handle) => {
    try {
      const res = await fetch(
        `https://competeapi.vercel.app/user/leetcode/${handle}`
      );
      const data = await res.json();
      const matchedUser = data?.data?.matchedUser ?? data?.matchedUser;
      const contestRanking =
        data?.data?.userContestRanking ?? data?.userContestRanking;
      if (matchedUser) {
        const allStats = matchedUser.submitStats?.acSubmissionNum?.find(
          (s) => s.difficulty === "All"
        );
        setLcInfo({
          username: matchedUser.username,
          problemsSolved: allStats?.count ?? 0,
          rating: contestRanking?.rating,
        });
      } else {
        setLcInfo(null);
      }
    } catch (error) {
      console.error("Error fetching LeetCode info:", error);
      setLcInfo(null);
    }
  };

  // Fetch CodeChef info (star rating + numeric rating)
  const fetchCodeChefInfo = async (handle) => {
    try {
      const res = await fetch(
        `https://competeapi.vercel.app/user/codechef/${handle}`
      );
      const data = await res.json();
      setCcInfo(data);
    } catch (error) {
      console.error("Error fetching CodeChef info:", error);
      setCcInfo(null);
    }
  };

  const handleEdit = () => setIsEditing(true);
  const handleProfileUpdate = async (updatedData) => {
    try {
      const jwtoken = localStorage.getItem("jwtoken");
      const res = await fetch(`${backend}/user/profile/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtoken}`,
        },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) {
        throw new Error("Failed to update profile");
      }
      const data = await res.json();
      setUserData(data.user || updatedData); // Prefer backend's updated user
      setIsEditing(false); // <-- This ensures you exit edit mode
      showToastMessage("Profile updated successfully!");
      const updatedUser = data.user || updatedData;
      if (updatedUser.codeforcesHandle) {
        fetchCodeforcesInfo(updatedUser.codeforcesHandle);
      }
      if (updatedUser.leetcodeHandle) {
        fetchLeetCodeInfo(updatedUser.leetcodeHandle);
      }
      if (updatedUser.codechefHandle) {
        fetchCodeChefInfo(updatedUser.codechefHandle);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showToastMessage("Failed to update profile. Please try again.");
    }
  };

  if (isEditing) {
    return (
      <EditProfile
        userData={userData}
        onUpdate={handleProfileUpdate}
        showToast={showToastMessage}
      />
    );
  }

  return (
    <div className="profile-container">
      <h1 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        Profile Page
      </h1>
      <div className="profile-box">
        <div className="profile-picture-box">
          <img
            src={
              userData.profilePicture && userData.profilePicture.trim() !== ""
                ? userData.profilePicture
                : "https://static.vecteezy.com/system/resources/thumbnails/019/879/186/small_2x/user-icon-on-transparent-background-free-png.png"
            }
            alt="Profile"
            className="profile-pic"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://static.vecteezy.com/system/resources/thumbnails/019/879/186/small_2x/user-icon-on-transparent-background-free-png.png";
            }}
          />
        </div>
        <div className="info-box">
          <div className="user-details-box">
            <h2>{userData.name}</h2>
            <p>{userData.email}</p>
            <p>{userData.phoneNumber}</p>
          </div>
          <div className="codeforces-box">
            <h3>Codeforces Handle: {userData.codeforcesHandle || "Not set"}</h3>
            <p>Rating: {cfInfo?.rating ?? "N/A"}</p>
          </div>
          <div className="leetcode-box">
            <h3>LeetCode Handle: {userData.leetcodeHandle || "Not set"}</h3>
            <p>Problems Solved: {lcInfo ? lcInfo.problemsSolved : "N/A"}</p>
            <p>Contest Rating: {lcInfo?.rating ?? "N/A"}</p>
          </div>
          <div className="codechef-box">
            <h3>CodeChef Handle: {userData.codechefHandle || "Not set"}</h3>
            <p>
              Rating: {ccInfo?.rating_number ?? "N/A"}
              {ccInfo?.rating ? ` (${ccInfo.rating})` : ""}
            </p>
          </div>
          <div className="skills-box">
            <h3>Programming Languages</h3>
            {Array.isArray(userData.programmingLanguages) &&
            userData.programmingLanguages.length > 0 ? (
              <ul>
                {userData.programmingLanguages.map((lang, i) => (
                  <li key={i}>{lang}</li>
                ))}
              </ul>
            ) : (
              <p>No languages listed</p>
            )}
            <h3>Skills</h3>
            {Array.isArray(userData.skills) && userData.skills.length > 0 ? (
              <ul>
                {userData.skills.map((skill, i) => (
                  <li key={i}>{skill}</li>
                ))}
              </ul>
            ) : (
              <p>No skills listed</p>
            )}
          </div>
        </div>
        <button onClick={handleEdit} className="edit-btn">
          Edit Profile
        </button>
      </div>
      {showToast && (
        <Toast message={toastMessage} onClose={() => setShowToast(false)} />
      )}
    </div>
  );
};

export default UserProfile;
