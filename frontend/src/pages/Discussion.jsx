// src/pages/Discussion.js
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/discussion.css";

function Discussion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = import.meta.env.VITE_BACKEND_URL;
  
  const [solutions, setSolutions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSolutions = async () => {
      try {
        const { data } = await axios.get(`${api}/discussion/${id}`);
        setSolutions(data.posts || []);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to load solutions");
        setIsLoading(false);
      }
    };

    fetchSolutions();
  }, [id, api]);

  if (isLoading) return <div className="loading">Loading solutions...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="discussion-page">
      <button onClick={() => navigate(-1)} className="back-button">
        Back to Problem
      </button>
      
      <h1>Solutions for Problem #{id}</h1>
      
      <div className="solutions-list">
        {solutions.length > 0 ? (
          solutions.map((solution, index) => (
            <div key={index} className="solution-card">
              <div className="solution-header">
                <span className="solution-author">{solution.userId?.username || "Anonymous"}</span>
                <span className="solution-date">
                  {new Date(solution.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="solution-content">{solution.content}</div>
            </div>
          ))
        ) : (
          <p>No solutions posted yet.</p>
        )}
      </div>
    </div>
  );
}

export default Discussion;