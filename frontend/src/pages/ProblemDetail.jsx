import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import CodeEditor from "../components/CodeEditor";
// import Loader from "../components/Loader";
import "../styles/ProblemDetail.css";

const ProblemDetail = () => {
  const { titleSlug } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [code, setCode] = useState("");
  const [input, setInput] = useState(""); // Add this line
  const [submissionResult, setSubmissionResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [language, setLanguage] = useState("cpp"); // Add language state
  const backend = process.env.REACT_APP_BACKEND_URL;
  const LEETCODE_API = `https://leetcode-api-mu.vercel.app/select?titleSlug=${titleSlug}`;

  useEffect(() => {
    // Redirect to the login page if the user is not authenticated
    const jwtoken = localStorage.getItem("jwtoken");
    if (jwtoken === null || jwtoken === undefined) {
      navigate("/login");
    }
  });

  useEffect(() => {
    async function fetchProblem() {
      try {
        const res = await axios.get(LEETCODE_API);
        setData(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProblem();
  }, [titleSlug]);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
  };

  const handleSubmit = async () => {
    if (!code) return;

    setIsSubmitting(true);
    try {
      // Get token from where you stored it (localStorage, cookies, etc.)
      const token = localStorage.getItem("jwtoken"); // or your token storage method

      if (!token) {
        throw new Error("No authentication token found. Please login.");
      }

      const response = await axios.post(
        `${backend}/api/solutions/submit`,
        {
          problemSlug: titleSlug,
          code,
          language: language,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSubmissionResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      // If unauthorized, redirect to login
      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDiscussions = () => {
    navigate(`/discussions/${titleSlug}`);
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

  if (loading) {
    return <>Loading...</>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="app-container">
      <div className="main-grid">
        {/* Left Panel - Problem Viewer */}
        <div className="panel">
          {data && (
            <>
              <h1 className="problem-title">{data.questionTitle}</h1>
              <h2 className="difficulty-text">
                Difficulty:{" "}
                <span className={getDifficultyClass(data.difficulty)}>
                  {data.difficulty}
                </span>
              </h2>
              <div
                className="question-content"
                dangerouslySetInnerHTML={{ __html: data.question }}
              />
              <h2 className="sample-tests-title">Sample Test Cases</h2>
              <pre className="sample-tests-box">{data.exampleTestcases}</pre>
              <div className="tags-container">
                Tags:{" "}
                {data.topicTags.map((tag) => (
                  <span key={tag.name} className="tag">
                    {tag.name}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right Panel - Code Editor */}
        <div className="panel">
          <CodeEditor
            value={code}
            onChange={setCode}
            inputValue={input}
            onInputChange={setInput}
            language={language}
            onLanguageChange={setLanguage}
          />
          <div className="action-buttons">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="submit-button"
            >
              {isSubmitting ? "Submitting..." : "Submit Solution"}
            </button>
            <button
              onClick={handleViewDiscussions}
              className="discussions-button"
            >
              View Discussions
            </button>
          </div>
          {submissionResult && (
            <div
              className={`submission-result ${
                submissionResult.passed ? "success" : "error"
              }`}
            >
              <h3>Submission Result</h3>
              <p>{submissionResult.message}</p>
              {submissionResult.details && (
                <pre>{submissionResult.details}</pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail;
