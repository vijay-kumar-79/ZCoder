import React from "react";
import "./ProblemCard.css"; // Optional: Add styles as needed

const ProblemCard = ({
  id,
  title,
  platform,
  difficulty,
  Accuracy,
  locked,
  tags,
  onClick,
}) => {
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
      </div>

      <div className="card-info">
        <span className="platform">{platform}</span>
        <span
          className="difficulty"
          style={{ color: getDifficultyColor(difficulty) }}
        >
          {difficulty}
        </span>
        <span className="accuracy">
          Accuracy: {Accuracy.toFixed(2)}%
        </span>
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
