import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProblemCard from "../components/Problemcard";
import "../styles/Dashboard.css";

// Static tag list from Leetcode
const STATIC_TAGS = [
  "Array",
  "String",
  "Hash Table",
  "Dynamic Programming",
  "Math",
  "Sorting",
  "Greedy",
  "Depth-First Search",
  "Binary Search",
  "Database",
  "Matrix",
  "Tree",
  "Breadth-First Search",
  "Bit Manipulation",
  "Two Pointers",
  "Prefix Sum",
  "Heap (Priority Queue)",
  "Simulation",
  "Binary Tree",
  "Stack",
  "Graph",
  "Counting",
  "Sliding Window",
  "Design",
  "Enumeration",
  "Backtracking",
  "Union Find",
  "Linked List",
  "Ordered Set",
  "Number Theory",
  "Monotonic Stack",
  "Segment Tree",
  "Trie",
  "Combinatorics",
  "Bitmask",
  "Queue",
  "Divide and Conquer",
  "Recursion",
  "Binary Indexed Tree",
  "Memoization",
  "Hash Function",
  "Geometry",
  "Binary Search Tree",
  "String Matching",
  "Topological Sort",
  "Shortest Path",
  "Rolling Hash",
  "Game Theory",
  "Interactive",
  "Data Stream",
  "Monotonic Queue",
  "Brainteaser",
  "Doubly-Linked List",
  "Randomized",
  "Merge Sort",
  "Counting Sort",
  "Iterator",
  "Concurrency",
  "Probability and Statistics",
  "Quickselect",
  "Suffix Array",
  "Line Sweep",
  "Bucket Sort",
  "Minimum Spanning Tree",
  "Shell",
  "Reservoir Sampling",
  "Strongly Connected Component",
  "Eulerian Circuit",
  "Radix Sort",
  "Rejection Sampling",
  "Biconnected Component",
];

const PAGE_SIZE = 25;

function Dashboard() {
  const navigate = useNavigate();
  const backend = process.env.REACT_APP_BACKEND_URL;
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [jumpInput, setJumpInput] = useState("1");
  const [selectedTags, setSelectedTags] = useState([]);
  const [filterMode, setFilterMode] = useState("OR"); // as toggles btw STATE

  useEffect(() => {
    async function fetchProblems() {
      setLoading(true);
      setFetchError(null);
      try {
        // /api/problems on our backend returns the FULL catalog (fetched from
        // the LeetCode mirror in pages and cached) instead of the mirror's
        // fixed 100-problem cap.
        const response = await axios.get(`${backend}/api/problems`);
        setProblems(response.data.problemsetQuestionList || []);
      } catch (error) {
        console.error("Error fetching problems:", error);
        setFetchError(
          error.response?.data?.error ||
            "Could not load problems. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProblems();
  }, [backend]);

  // Any filter change restarts browsing from the first page
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTags, filterMode]);

  useEffect(() => {
    // Redirect to the login page if the user is not authenticated
    const jwtoken = localStorage.getItem("jwtoken");
    if (jwtoken === null || jwtoken === undefined) {
      navigate("/login");
    }
  }, [navigate]);

  const handleCardClick = (titleSlug) => {
    navigate(`/problem/${titleSlug}`); //take inp as params in this route
  };

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredProblems =
    selectedTags.length === 0
      ? problems
      : problems.filter((problem) => {
          const tagNames = problem.topicTags.map((tag) => tag.name);
          return filterMode === "OR"
            ? selectedTags.some((tag) => tagNames.includes(tag))
            : selectedTags.every((tag) => tagNames.includes(tag));
        });

  // --- Pagination (client-side over the full fetched catalog) ---
  const totalPages = Math.max(1, Math.ceil(filteredProblems.length / PAGE_SIZE));
  // Clamp in case a filter change shrinks the list while we are past the end
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageProblems = filteredProblems.slice(pageStart, pageStart + PAGE_SIZE);

  // Keep the jump box in sync with the current page
  useEffect(() => {
    setJumpInput(String(safePage));
  }, [safePage]);

  // Compact numbered pagination: 1 ... 4 5 [6] 7 8 ... 20
  const pageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - safePage) <= 2) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

  const goToPage = (page) => {
    if (page < 1 || page > totalPages || page === safePage) return;
    setCurrentPage(page);
    // Bring the list back into view when jumping pages
    document
      .getElementById("problem-list-top")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const applyJump = () => {
    const parsed = parseInt(jumpInput, 10);
    if (Number.isNaN(parsed)) {
      setJumpInput(String(safePage));
      return;
    }
    goToPage(Math.min(totalPages, Math.max(1, parsed)));
  };

  return (
    <div className="dashboard-page">
      <h1>Problems</h1>

      {/* Filter Mode Toggle */}
      <div className="filter-mode-toggle">
        <p>Filter Mode:</p>
        <button
          onClick={() =>
            setFilterMode((prev) => (prev === "OR" ? "AND" : "OR"))
          }
        >
          {filterMode} (Click to switch)
        </button>
      </div>

      {/* Static Tags*/}
      <div className="tag-filters">
        <p>Filter by Tags:</p>
        <div className="tag-container">
          {STATIC_TAGS.map((tag) => (
            <button
              key={tag}
              className={`tag-button ${
                selectedTags.includes(tag) ? "selected" : ""
              }`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Problem List */}
      <div id="problem-list-top" className="problems-container">
        {loading ? (
          <div className="no-problems">Loading problems...</div>
        ) : fetchError ? (
          <div className="no-problems">{fetchError}</div>
        ) : filteredProblems.length === 0 ? (
          <div className="no-problems">
            No problems found for the selected filters.
          </div>
        ) : (
          <>
            <p className="results-summary">
              Showing {pageStart + 1}–
              {Math.min(pageStart + PAGE_SIZE, filteredProblems.length)} of{" "}
              {filteredProblems.length} problem
              {filteredProblems.length === 1 ? "" : "s"}
              {selectedTags.length > 0 ? " (filtered)" : ""}
            </p>
            <ul className="problem-list">
              {pageProblems.map((problem) => (
                <li key={problem.questionFrontendId}>
                  <ProblemCard
                    title={problem.title}
                    platform={"Leetcode"}
                    difficulty={problem.difficulty}
                    Accuracy={problem.acRate}
                    locked={problem.isPaidOnly}
                    onClick={() => handleCardClick(problem.titleSlug)}
                    titleSlug={problem.titleSlug}
                  />
                </li>
              ))}
            </ul>

            {totalPages > 1 && (
              <nav className="pagination" aria-label="Problem list pages">
                <button
                  className="page-button"
                  disabled={safePage === 1}
                  onClick={() => goToPage(safePage - 1)}
                >
                  ← Prev
                </button>
                {pageNumbers().map((p, idx) =>
                  p === "..." ? (
                    <span key={`e-${idx}`} className="page-ellipsis">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      className={`page-button${p === safePage ? " active" : ""}`}
                      aria-current={p === safePage ? "page" : undefined}
                      onClick={() => goToPage(p)}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  className="page-button"
                  disabled={safePage === totalPages}
                  onClick={() => goToPage(safePage + 1)}
                >
                  Next →
                </button>

                <span className="page-jump">
                  <label htmlFor="page-jump-input">Go to</label>
                  <input
                    id="page-jump-input"
                    type="number"
                    min={1}
                    max={totalPages}
                    value={jumpInput}
                    onChange={(e) => setJumpInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") applyJump();
                    }}
                    aria-label={`Jump to page (1 to ${totalPages})`}
                  />
                  <span>of {totalPages}</span>
                </span>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
