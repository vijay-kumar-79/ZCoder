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

  const getDifficultyClass = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "difficulty-easy";
      case "Medium":
        return "difficulty-medium";
      case "Hard":
        return "difficulty-hard";
      default:
        return "";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className="problem-card"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Open problem ${title}`}
    >
      <div className="card-header">
        <span className="problem-id">#{id}</span>
        <span className="problem-title">{title}</span>
        {locked && <span className="locked-icon">🔒</span>}
        <button
          onClick={toggleBookmark}
          disabled={loadingBookmark}
          aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
          aria-pressed={isBookmarked}
          className={`bookmark-btn${isBookmarked ? " active" : ""}`}
        >
          {loadingBookmark ? (
            <span aria-hidden="true">...</span>
          ) : isBookmarked ? (
            <FaBookmark />
          ) : (
            <CiBookmark />
          )}
        </button>
      </div>

      <div className="card-info">
        <span className="platform">{platform}</span>
        <span className={`difficulty ${getDifficultyClass(difficulty)}`}>
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