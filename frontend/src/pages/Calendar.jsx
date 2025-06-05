import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Calendar.css";

// Error Boundary Component
class CalendarErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Calendar Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>Something went wrong with the calendar</h2>
          <p>Please refresh the page or try again later.</p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="retry-button"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Enhanced localStorage hook with better persistence
const useStickyState = (defaultValue, key) => {
  const [value, setValue] = useState(() => {
    try {
      if (typeof window === "undefined") return defaultValue;

      const stickyValue = window.localStorage.getItem(key);
      if (stickyValue !== null) {
        const parsed = JSON.parse(stickyValue);

        // Special handling for date objects
        if (key === "calendar-current-date") {
          const date = new Date(parsed);
          return isNaN(date.getTime()) ? defaultValue : date;
        }

        return parsed;
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    }
    return defaultValue;
  });

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Error saving to localStorage key "${key}":`, error);
    }
  }, [key, value]);

  return [value, setValue];
};

// Loading Component
const LoadingSpinner = () => (
  <div className="loading-container">
    <div className="loading-spinner">⟳</div>
    <p>Loading contests...</p>
  </div>
);

// Main Calendar Component
const Calendar = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the login page if the user is not authenticated
    const jwtoken = localStorage.getItem("jwtoken");
    if (jwtoken === null || jwtoken === undefined) {
      navigate("/login");
    }
  });

  // State management with persistent storage
  const [currentDate, setCurrentDate] = useStickyState(
    new Date(),
    "calendar-current-date"
  );
  const [contests, setContests] = useStickyState([], "calendar-contests");
  const [selectedDateContests, setSelectedDateContests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [dataFetched, setDataFetched] = useStickyState(
    false,
    "calendar-data-fetched"
  );

  useEffect(() => {
    const jwtoken = localStorage.getItem("jwtoken");
    if (!jwtoken) {
      navigate("/login");
    }
  }, [navigate]);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  useEffect(() => {
    if (
      !currentDate ||
      !(currentDate instanceof Date) ||
      isNaN(currentDate.getTime())
    ) {
      setCurrentDate(new Date());
    }
    setInitialized(true);
  }, [currentDate, setCurrentDate]);

  const fetchCodeforcesContests = useCallback(async () => {
    try {
      const response = await fetch("https://codeforces.com/api/contest.list");
      if (!response.ok) throw new Error("Codeforces API failed");

      const data = await response.json();
      return data.status === "OK"
        ? data.result
            .filter((contest) => contest.phase === "BEFORE")
            .slice(0, 10)
            .map((contest) => ({
              name: contest.name,
              site: "Codeforces",
              start_time: new Date(
                contest.startTimeSeconds * 1000
              ).toISOString(),
              duration: contest.durationSeconds,
              url: `https://codeforces.com/contest/${contest.id}`,
            }))
        : [];
    } catch (error) {
      console.error("Codeforces API error:", error);
      return [];
    }
  }, []);

  const fetchLeetCodeContests = useCallback(async () => {
    try {
      const response = await fetch("https://leetcode.com/contest/api/list");
      if (!response.ok) throw new Error("LeetCode API failed");

      const data = await response.json();
      return data.contests.map((contest) => ({
        name: contest.title,
        site: "LeetCode",
        start_time: new Date(contest.start_time * 1000).toISOString(),
        duration: contest.duration,
        url: `https://leetcode.com/contest/${contest.title_slug}`,
      }));
    } catch (error) {
      console.error("LeetCode API error:", error);
      return [];
    }
  }, []);

  const fetchCodeChefContests = useCallback(async () => {
    try {
      // Using a CORS proxy to avoid CORS issues
      const proxyUrl = "https://cors-anywhere.herokuapp.com/";
      const targetUrl = "https://codechef-api.herokuapp.com/contests/future";
      const response = await fetch(proxyUrl + targetUrl);

      if (!response.ok) throw new Error("CodeChef API failed");

      const data = await response.json();
      return Array.isArray(data)
        ? data.slice(0, 10).map((contest) => ({
            name: contest.name,
            site: "CodeChef",
            start_time: contest.start,
            duration: contest.duration || 10800,
            url: contest.url || "https://codechef.com",
          }))
        : [];
    } catch (error) {
      console.error("CodeChef API error:", error);
      return [];
    }
  }, []);

  const generateSampleContests = useCallback(() => {
    const now = new Date();
    const sampleContests = [];
    const platforms = [
      "Codeforces",
      "LeetCode",
      "AtCoder",
      "CodeChef",
      "GeeksforGeeks",
    ];

    for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
      const currentMonth = new Date(
        now.getFullYear(),
        now.getMonth() + monthOffset,
        1
      );
      const daysInMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        0
      ).getDate();

      const contestsThisMonth = Math.floor(Math.random() * 3) + 4;

      for (let i = 0; i < contestsThisMonth; i++) {
        const contestDate = new Date(currentMonth);
        contestDate.setDate(Math.floor(Math.random() * daysInMonth) + 1);
        contestDate.setHours(Math.floor(Math.random() * 12) + 10);
        contestDate.setMinutes(Math.floor(Math.random() * 4) * 15);

        if (contestDate >= now) {
          const platform =
            platforms[Math.floor(Math.random() * platforms.length)];
          const contestTypes = ["Round", "Contest", "Challenge", "Cup"];
          const contestType =
            contestTypes[Math.floor(Math.random() * contestTypes.length)];

          sampleContests.push({
            name: `${platform} ${contestType} ${Math.floor(
              Math.random() * 1000
            )}`,
            site: platform,
            start_time: contestDate.toISOString(),
            duration: [3600, 5400, 7200, 10800][Math.floor(Math.random() * 4)],
            url: `https://${platform.toLowerCase().replace(" ", "")}.com`,
          });
        }
      }
    }

    return sampleContests.sort(
      (a, b) => new Date(a.start_time) - new Date(b.start_time)
    );
  }, []);

  const fetchContestsFromAllPlatforms = useCallback(async () => {
    if (dataFetched && contests.length > 0) {
      console.log("Using cached contest data");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Fetching contests from all platforms...");

      const results = await Promise.allSettled([
        fetchCodeforcesContests(),
        fetchLeetCodeContests(),
        fetchCodeChefContests(),
      ]);

      const allContests = results
        .filter((result) => result.status === "fulfilled")
        .flatMap((result) => result.value)
        .filter((contest) => contest && contest.name);

      console.log(`Fetched ${allContests.length} contests from APIs`);

      if (allContests.length === 0) {
        console.log("No contests from APIs, using sample data");
        const sampleContests = generateSampleContests();
        setContests(sampleContests);
      } else {
        const sampleContests = generateSampleContests();
        const combinedContests = [...allContests, ...sampleContests].sort(
          (a, b) => new Date(a.start_time) - new Date(b.start_time)
        );
        setContests(combinedContests);
      }

      setDataFetched(true);
    } catch (error) {
      console.error("Error fetching contests:", error);
      setError("Failed to fetch contests. Using sample data.");

      const sampleContests = generateSampleContests();
      setContests(sampleContests);
      setDataFetched(true);
    } finally {
      setLoading(false);
    }
  }, [
    dataFetched,
    contests.length,
    fetchCodeforcesContests,
    fetchLeetCodeContests,
    fetchCodeChefContests,
    generateSampleContests,
    setContests,
    setDataFetched,
  ]);

  useEffect(() => {
    if (initialized && !dataFetched) {
      fetchContestsFromAllPlatforms();
    }
  }, [initialized, dataFetched, fetchContestsFromAllPlatforms]);

  const getDaysInMonth = useCallback((date) => {
    if (!date || !(date instanceof Date)) return 31;
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }, []);

  const getFirstDayOfMonth = useCallback((date) => {
    if (!date || !(date instanceof Date)) return 0;
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1;
  }, []);

  const hasContestOnDate = useCallback(
    (date) => {
      if (!contests || !Array.isArray(contests)) return false;

      const targetDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      return contests.some((contest) => {
        try {
          const contestDate = new Date(contest.start_time);
          const contestDateOnly = new Date(
            contestDate.getFullYear(),
            contestDate.getMonth(),
            contestDate.getDate()
          );
          return targetDate.getTime() === contestDateOnly.getTime();
        } catch (error) {
          return false;
        }
      });
    },
    [contests]
  );

  const getContestsForDate = useCallback(
    (date) => {
      if (!contests || !Array.isArray(contests)) return [];

      const targetDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      return contests
        .filter((contest) => {
          try {
            const contestDate = new Date(contest.start_time);
            const contestDateOnly = new Date(
              contestDate.getFullYear(),
              contestDate.getMonth(),
              contestDate.getDate()
            );
            return targetDate.getTime() === contestDateOnly.getTime();
          } catch (error) {
            return false;
          }
        })
        .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
    },
    [contests]
  );

  const getContestCountForDate = useCallback(
    (date) => {
      return getContestsForDate(date).length;
    },
    [getContestsForDate]
  );

  const handleDateClick = useCallback(
    (day) => {
      try {
        const clickedDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          day
        );
        const contestsForDate = getContestsForDate(clickedDate);
        setSelectedDateContests(contestsForDate);
      } catch (error) {
        console.error("Error handling date click:", error);
        setSelectedDateContests([]);
      }
    },
    [currentDate, getContestsForDate]
  );

  const navigateMonth = useCallback((direction) => {
    setCurrentDate((prevDate) => {
      try {
        const newDate = new Date(prevDate);
        const newMonth = newDate.getMonth() + direction;

        if (newMonth > 11) {
          return new Date(newDate.getFullYear() + 1, 0, 1);
        } else if (newMonth < 0) {
          return new Date(newDate.getFullYear() - 1, 11, 1);
        } else {
          return new Date(newDate.getFullYear(), newMonth, 1);
        }
      } catch (error) {
        console.error("Error navigating month:", error);
        return new Date();
      }
    });
    setSelectedDateContests([]);
  }, []);

  const navigateYear = useCallback((direction) => {
    setCurrentDate((prevDate) => {
      try {
        const newDate = new Date(prevDate);
        return new Date(
          newDate.getFullYear() + direction,
          newDate.getMonth(),
          1
        );
      } catch (error) {
        console.error("Error navigating year:", error);
        return new Date();
      }
    });
    setSelectedDateContests([]);
  }, []);

  const renderCalendarDays = useCallback(() => {
    if (!currentDate || !(currentDate instanceof Date)) {
      return <div>Error: Invalid date</div>;
    }

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const hasContest = hasContestOnDate(date);
      const contestCount = getContestCountForDate(date);

      days.push(
        <div
          key={day}
          className={`calendar-day ${hasContest ? "has-contest" : ""}`}
          onClick={() => handleDateClick(day)}
        >
          <span className="day-number">{day}</span>
          {hasContest && (
            <div className="contest-indicator">
              <div className="contest-dot"></div>
              {contestCount > 1 && (
                <div className="contest-count">{contestCount}</div>
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  }, [
    currentDate,
    getDaysInMonth,
    getFirstDayOfMonth,
    hasContestOnDate,
    getContestCountForDate,
    handleDateClick,
  ]);

  if (!initialized) {
    return <LoadingSpinner />;
  }

  if (
    !currentDate ||
    !(currentDate instanceof Date) ||
    isNaN(currentDate.getTime())
  ) {
    return (
      <div className="error-container">
        <h2>Calendar Error</h2>
        <p>Invalid date detected. Please refresh the page.</p>
        <button onClick={() => window.location.reload()}>Refresh</button>
      </div>
    );
  }

  return (
    <div className="calendar-container">
      <div className="calendar-wrapper">
        <div className="calendar-section">
          <div className="calendar-header">
            <div className="navigation">
              <button
                className="nav-button year-nav"
                onClick={() => navigateYear(-1)}
              >
                ‹‹
              </button>
              <button className="nav-button" onClick={() => navigateMonth(-1)}>
                ‹
              </button>
              <h2 className="month-year">
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button className="nav-button" onClick={() => navigateMonth(1)}>
                ›
              </button>
              <button
                className="nav-button year-nav"
                onClick={() => navigateYear(1)}
              >
                ››
              </button>
            </div>
          </div>

          <div className="calendar-grid">
            <div className="days-header">
              {daysOfWeek.map((day) => (
                <div key={day} className="day-header">
                  {day}
                </div>
              ))}
            </div>
            <div className="days-grid">{renderCalendarDays()}</div>
          </div>
        </div>

        <div className="contests-sidebar">
          <div className="contests-section">
            <h3>Contests</h3>

            {loading && <LoadingSpinner />}

            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}

            <div className="contests-list">
              {selectedDateContests.length > 0 ? (
                selectedDateContests.map((contest, index) => (
                  <div
                    key={`${contest.site}-${index}`}
                    className="contest-item"
                  >
                    <h4>
                      <span
                        className={`platform-badge platform-${contest.site.toLowerCase()}`}
                      >
                        {contest.site}
                      </span>
                      {contest.name}
                    </h4>
                    <p>
                      <span className="label">Start Time:</span>{" "}
                      {new Date(contest.start_time).toLocaleString()}
                    </p>
                    <p>
                      <span className="label">Duration:</span>{" "}
                      {typeof contest.duration === "number"
                        ? `${Math.floor(contest.duration / 3600)}h ${Math.floor(
                            (contest.duration % 3600) / 60
                          )}m`
                        : contest.duration}
                    </p>
                    {contest.url && (
                      <a
                        href={contest.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="contest-link"
                      >
                        View Contest
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-contests">
                  {loading ? "Loading..." : "Click on a date to see contests"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// CalendarWithErrorBoundary wrapper
const CalendarWithErrorBoundary = () => (
  <CalendarErrorBoundary>
    <Calendar />
  </CalendarErrorBoundary>
);

export default CalendarWithErrorBoundary;
