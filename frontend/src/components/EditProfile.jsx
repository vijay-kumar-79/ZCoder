// 30-05-2025 8:00 pm

import React, { useState } from "react";
import axios from "axios";

const EditProfile = ({ userData, onUpdate, showToast }) => {
  // Local state for editable fields (initialize with current user data)
  const [formData, setFormData] = useState({ ...userData });
  const backend = process.env.REACT_APP_BACKEND_URL;
  // Local state for password section
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Cancel should reset edits to original data
  const handleCancel = () => {
    setFormData({ ...userData });
    setPasswords({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    if (typeof onUpdate === "function") {
      onUpdate(userData); // Just to exit edit mode
    }
  };

  // Handle profile field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle password field changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  // Handle profile picture file input
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, profilePicture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Save profile changes (excluding password)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const jwtoken = localStorage.getItem("jwtoken");
      if (!jwtoken) {
        throw new Error("No authentication token found");
      }

      const response = await axios.post(
        `${backend}/user/profile/update`, // Correct endpoint
        formData,
        {
          headers: {
            Authorization: `Bearer ${jwtoken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.message) {
        showToast && showToast(response.data.message);
        onUpdate && onUpdate(response.data.user);
      }
    } catch (err) {
      console.error("Update error:", err);
      showToast &&
        showToast(err.response?.data?.error || "Failed to update profile");
    }
  };

  // Save password changes
  const handleSavePassword = async (e) => {
    e.preventDefault();
    try {
      if (passwords.newPassword !== passwords.confirmPassword) {
        throw new Error("Passwords don't match");
      }

      const token = localStorage.getItem("jwtoken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.post(
        `${backend}/user/profile/update-password`,
        {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      showToast &&
        showToast(response.data.message || "Password updated successfully");
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Exit edit mode after successful password update
      if (typeof onUpdate === "function") {
        onUpdate(); // This will set isEditing to false in UserProfile
      }
    } catch (err) {
      console.error("Password update error:", err);
      showToast &&
        showToast(
          err.response?.data?.error ||
            err.message ||
            "Failed to update password"
        );
    }
  };

  return (
    <div className="edit-profile-container">
      <h2>Edit Profile</h2>
      {/* Profile Fields Section */}
      <form onSubmit={handleSaveProfile}>
        <div className="edit-section">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label>Profile Picture</label>
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </div>
          <div className="form-group">
            <label>Codeforces Handle</label>
            <input
              type="text"
              name="codeforcesHandle"
              value={formData.codeforcesHandle}
              onChange={handleChange}
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label>Programming Languages (comma separated)</label>
            <input
              type="text"
              name="programmingLanguages"
              value={(formData.programmingLanguages || []).join(", ")}
              onChange={(e) => {
                const langs = e.target.value.split(",").map((l) => l.trim());
                setFormData((prev) => ({
                  ...prev,
                  programmingLanguages: langs,
                }));
              }}
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label>Skills (comma separated)</label>
            <input
              type="text"
              name="skills"
              value={(formData.skills || []).join(", ")}
              onChange={(e) => {
                const skills = e.target.value.split(",").map((s) => s.trim());
                setFormData((prev) => ({
                  ...prev,
                  skills,
                }));
              }}
              autoComplete="off"
            />
          </div>

          {/* Save and Cancel Buttons */}
          <div className="button-row">
            <button type="submit" className="update-btn">
              Save Changes
            </button>
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      </form>

      {/* Password Change Section */}
      <form onSubmit={handleSavePassword}>
        <div className="edit-section password-section">
          <h3>Change Password</h3>
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={passwords.currentPassword}
              onChange={handlePasswordChange}
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handlePasswordChange}
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handlePasswordChange}
              autoComplete="off"
            />
          </div>
          <div className="button-row">
            <button type="submit" className="update-btn">
              Save Password
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
