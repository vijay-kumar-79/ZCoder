import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Problemcard.css";
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
  const [loadingBookmark, setLoadingBookmark] = useState(true);
  const backend = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const checkBookmark = async () => {
      try {
        const response = await axios.get(`${backend}/bookmarks`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("jwtoken")}` },
        });

        // Add null checks for response data
        const bookmarks = response.data?.bookmarks || [];
        setIsBookmarked(bookmarks.includes(titleSlug));
      } catch (error) {
        console.error("Error checking bookmark:", error);
        setIsBookmarked(false);
      } finally {
        setLoadingBookmark(false);
      }
    };

    if (titleSlug) {
      checkBookmark();
    }
  }, [titleSlug, backend]);

  const toggleBookmark = async (e) => {
    e.stopPropagation();

    if (loadingBookmark) return;

    try {
      setLoadingBookmark(true);
      await axios.post(
        `${backend}/bookmarks/toggle`,
        { problemSlug: titleSlug },
        { headers: { Authorization: `Bearer ${localStorage.getItem("jwtoken")}` } }
      );
      setIsBookmarked((prev) => !prev);
      if (onBookmarkToggle) onBookmarkToggle(titleSlug, !isBookmarked);
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    } finally {
      setLoadingBookmark(false);
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
        <button
          onClick={toggleBookmark}
          disabled={loadingBookmark}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: isBookmarked ? "#00D4FF" : "#ccc",
            transition: "color 0.3s ease",
            padding: 0,
            fontSize: "1.2rem"
          }}
        >
          {loadingBookmark ? (
            <span>...</span>
          ) : isBookmarked ? (
            <FaBookmark />
          ) : (
            <CiBookmark />
          )}
        </button>
      </div>

      <div className="card-info">
        <span className="platform">{platform}</span>
        <span
          className="difficulty"
          style={{ color: getDifficultyColor(difficulty) }}
        >
          {difficulty}
        </span>
        <span className="accuracy">Accuracy: {Accuracy?.toFixed(2) || 0}%</span>
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