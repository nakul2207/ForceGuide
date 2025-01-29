import { useState, useEffect } from "react";
import "./Contentpage.css";

interface SubmissionData {
  submissionLink: string;
  language: string;
}

export const ContentPage = () => {
  const [isPromptVisible, setIsPromptVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submissionids, setSubmissionids] = useState<number[]>([]);
  const [ytVideoId, setYtVideoId] = useState<string>("");
  const [language, setLanguage] = useState<string>("C++");
  const [error, setError] = useState<string | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Parse URL to get contest and problem info
  const currentUrl = window.location.href;
  const parts = currentUrl.split("/");
  
  let contestId: number;
  let problemIndex: string;
  
  if (currentUrl.includes("/problemset/problem/")) {
    contestId = parseInt(parts[parts.length - 2]);
    problemIndex = parts[parts.length - 1];
  } else {
    contestId = parseInt(parts[parts.length - 3]);
    problemIndex = parts[parts.length - 1];
  }

  const handleButtonClick = () => {
    setIsPromptVisible(!isPromptVisible);
    setError(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!isPromptVisible || initialLoadDone) return;
      
      try {
        setIsLoading(true);
        setError(null);

        // Get stored language preference
        const storageResult = await new Promise<{ [key: string]: any }>(resolve => 
          chrome.storage.local.get(["selectedLanguage"], resolve)
        );
        const storedLanguage = storageResult.selectedLanguage || language;
        setLanguage(storedLanguage);

        // Get problem info from current page first
        const problemInfoResponse = await new Promise<any>(resolve => {
          chrome.runtime.sendMessage({
            type: 'FETCH_PROBLEM_INFO'
          }, resolve);
        });

        if (problemInfoResponse.error) {
          throw new Error(problemInfoResponse.error);
        }

        // Search for video only if not already fetched
        if (!ytVideoId) {
          const videoResponse = await new Promise<any>(resolve => {
            chrome.runtime.sendMessage({
              type: 'SEARCH_VIDEO',
              query: problemInfoResponse.contestName
            }, resolve);
          });

          if (videoResponse.error) {
            console.error('Video search error:', videoResponse.error);
          } else {
            setYtVideoId(videoResponse);
          }
        }

        // Fetch submissions
        const submissionsResponse = await new Promise<any>(resolve => {
          chrome.runtime.sendMessage({
            type: 'FETCH_SUBMISSIONS',
            contestId,
            problemIndex,
            languagePrefix: storedLanguage.substring(0, 2).toLowerCase()
          }, resolve);
        });

        if (submissionsResponse.error) {
          throw new Error(submissionsResponse.error);
        }
        setSubmissionids(submissionsResponse.submissions);
        setInitialLoadDone(true);

      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isPromptVisible, contestId, problemIndex]);  

  return (
    <div className="content-page">
      <div className="problem-header">
        <button 
          className="show-answers-btn" 
          onClick={handleButtonClick}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : isPromptVisible ? 'Hide Answers' : 'Show Answers'}
        </button>
      </div>

      {isPromptVisible && (
        <div className="answer-prompt">
          <h2>Available Solutions</h2>
          {isLoading ? (
            <div className="loader"></div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            <>
              <div className="submission-container">
                {submissionids.length > 0 ? (
                  submissionids.map((submissionId, index) => (
                    <div key={submissionId} className="submission-item">
                      <a 
                        href={`https://codeforces.com/contest/${contestId}/submission/${submissionId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Solution #{index + 1}
                      </a>
                      <p>Language: {language}</p>
                    </div>
                  ))
                ) : (
                  <p>No solutions found for the selected language.</p>
                )}
              </div>
              
              {ytVideoId && (
                <>
                  <h2>Video Solution</h2>
                  <div className="video-container">
                    <iframe 
                      width="560"
                      height="315"
                      src={`https://www.youtube.com/embed/${ytVideoId}`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
