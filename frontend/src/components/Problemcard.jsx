import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ProblemCard.css";
import { CiBookmark } from "react-icons/ci";
import { FaBookmark } from "react-icons/fa";

const ProblemCard = ({
  id,
  title,
  platform,
  difficulty,
  Accuracy,
  locked,
  tags,
  onClick,
  titleSlug,
  onBookmarkToggle
}) => {
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const checkBookmark = async () => {
      try {
        const response = await axios.get("http://localhost:3000/bookmarks", {
          headers: { Authorization: `Bearer ${localStorage.getItem("jwtoken")}` },
        });
        setIsBookmarked(response.data.bookmarks.includes(titleSlug));
      } catch (error) {
        console.error("Error checking bookmark:", error);
      }
    };
    checkBookmark();
  }, [titleSlug]);

  const toggleBookmark = async (e) => {
    e.stopPropagation();
    console.log(e);
    try {
      await axios.post(
        "http://localhost:3000/bookmarks/toggle",
        { problemSlug: titleSlug },
        { headers: { Authorization: `Bearer ${localStorage.getItem("jwtoken")}` } }
      );
      setIsBookmarked((prev) => !prev);
      if (onBookmarkToggle) onBookmarkToggle(titleSlug);
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "green";
      case "Medium":
        return "orange";
      case "Hard":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <div className="problem-card" onClick={onClick}>
      <div className="card-header">
        <span className="problem-id">#{id}</span>
        <span className="problem-title">{title}</span>
        {locked && <span className="locked-icon">🔒</span>}
        <p
          onClick={toggleBookmark}
          // className={`bookmark-button ${isBookmarked ? "bookmarked" : ""}`}
          style={{
            // backgroundColor: "none",
            color: "#00D4FF",
            transition: "background-color 0.3s ease"
          }}
        >
          {!isBookmarked ? <CiBookmark/> : <FaBookmark/>}
        </p>
      </div>

      <div className="card-info">
        <span className="platform">{platform}</span>
        <span
          className="difficulty"
          style={{ color: getDifficultyColor(difficulty) }}
        >
          {difficulty}
        </span>
        <span className="accuracy">Accuracy: {Accuracy.toFixed(2)}%</span>
      </div>

      {tags && tags.length > 0 && (
        <div className="tags">
          {tags.map((tag, index) => (
            <span className="tag" key={index}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProblemCard;