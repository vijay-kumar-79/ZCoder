// components/SolutionDetail.js
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const SolutionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [solution, setSolution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Redirect to the login page if the user is not authenticated
    const jwtoken = localStorage.getItem("jwtoken");
    if (jwtoken === null || jwtoken === undefined) {
      navigate("/login");
    }
  });

  useEffect(() => {
    const fetchSolution = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/solutions/detail/${id}`
        );
        console.log("Solution data:", res.data);
        setSolution(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSolution();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!solution) return <div>Solution not found</div>;

  return (
    <div className="solution-detail">
      <button onClick={() => navigate(-1)} className="back-button">
        ← Back
      </button>
      <div className="solution-header">
        <h2>Solution by {solution.author?.Username || "Anonymous"}</h2>
        <span className="votes">Votes: {solution.votes}</span>
      </div>
      <div className="solution-meta">
        <span>Language: {solution.language}</span>
        <span>Posted: {new Date(solution.createdAt).toLocaleDateString()}</span>
      </div>
      <pre className="solution-code">
        <code>{solution.code}</code>
      </pre>
    </div>
  );
};

export default SolutionDetail;
