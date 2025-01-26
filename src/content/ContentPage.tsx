import  { useState, useEffect } from "react";
import axios from "axios";  
import "./Contentpage.css"; // Assuming you have a CSS file for styling
interface SubmissionData{
  submissionLink:string;
  language:string;
}

export const ContentPage = () => {
  // const apiKey = import.meta.env.VITE_YOUTUBE_APIKEY;
  // console.log(apiKey) 
  const [isPromptVisible, setIsPromptVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [submissionids, setSubmissionids] = useState<SubmissionData[]>([]);
  const [ytVideoId, setYtVideoId] = useState<string>("");
  const [language, setLanguage] = useState<string>("C++");

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
  };

  const fetchAcceptedSubmissions = async (contestId:number, problemIndex:string, language:string) => {
    try {
      // Fetch submissions from the contest
        const response = await axios.get('https://codeforces.com/api/contest.status', {
            params: {
                contestId: contestId,
                from: 1,
                count: 5000
            }
        });
        // Check if the API response is OK
        if (response.data.status !== 'OK') {
            throw new Error(response.data.comment);
        }

        // Get first two characters of the selected language for comparison
        const languagePrefix = language.substring(0, 2).toLowerCase();
        
        const acceptedSubmissions = response.data.result.filter((submission: any) => {
          return submission.problem.index === problemIndex &&
                submission.programmingLanguage.toLowerCase().startsWith(languagePrefix) && 
                submission.verdict === 'OK';
        }).map((submission: any) => submission.id);
        return acceptedSubmissions.slice(0, 5);
    } catch (error:any) {
        console.error('Error:', error.message);
        return [];
    }
  };
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setIsLoading(true);
        const storageResult = await new Promise<{ [key: string]: any }>(resolve => 
          chrome.storage.local.get(["selectedLanguage"], resolve)
        );
        const storedData = storageResult.selectedLanguage;
        setLanguage(storedData);


        // Create a new variable to use the latest language value
        const currentLanguage = storedData || language;
        const acceptedSubmissions = await fetchAcceptedSubmissions(contestId, problemIndex, currentLanguage);
        setSubmissionids(acceptedSubmissions);
  

        // Fetch the Codeforces HTML page
        const response = await fetch(`https://codeforces.com/contest/${contestId}/status/${problemIndex}`);
        const html = await response.text();


        // Parse the HTML using DOMParser
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const problemName = document.querySelector(".title")?.textContent;
        const contestRow  = doc.querySelectorAll<HTMLTableRowElement>(".rtable tr")
        const contest = contestRow[0].querySelector<HTMLAnchorElement>("a")
        const contestName = "Codeforces " + contest?.textContent +" "+ problemName;


        //search for video
        const url = `${import.meta.env.VITE_SERVER_URL}/search?q=${contestName}`;
        const result = await fetch(url)
        .then(response => response.json())
        .catch(error => console.error('Error:', error));
        setYtVideoId(result);

        // const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(contestName)}&type=video&key=${apiKey}`;
        // console.log(url)
        // await fetch(url)
        // .then(response => response.json())
        // .then(data => {
        //   const firstVideo = data.items[0];
        //   setYtVideoId(firstVideo.id.videoId);
        // })
        // .catch(error => console.error('Error:', error));

        // rows.forEach((row) => {
        //   const submissionLinkElement = row.querySelector<HTMLAnchorElement>("a.view-source");
        //   const languageElement = row.querySelector<HTMLTableCellElement>("td:nth-child(5)");

        //   if (submissionLinkElement && languageElement) {
        //     extractedSubmissions.push({
        //       submissionLink: `https://codeforces.com${submissionLinkElement.getAttribute("href")}`,
        //       language: languageElement.textContent?.trim() || "Unknown",
        //     });
        //   }
        // });
      } catch (err) {
        console.error(err);
        console.log("Failed to fetch submissions. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, [language, contestId, problemIndex]);

  return (
    <div className="content-page">
      <div className="problem-header">
        <button className="show-answers-btn" onClick={handleButtonClick}>
          Show Answers
        </button>
      </div>

      {/* Show prompt if visible */}
      {isPromptVisible && (
        <div className="answer-prompt">
          <h2>Available Solutions</h2>
          {isLoading ? (
            <div className="loader"></div>
          ) : (
            <>
            <div className="submission-container">
              {submissionids.length > 0 ? (
                submissionids.map((submission,index)=>{
                  return(
                    <div key={index} className="submission-item">
                      <a href={`https://codeforces.com/contest/${contestId}/submission/${submission}`} target="_blank" rel="noopener noreferrer">
                        Solution #{index + 1}
                      </a>
                      <p>Language: {language}</p>
                    </div>
                  )
                })
              ) : (
                <p>No Results Found</p>
              )}
            </div>
              {ytVideoId && (
                <>
                  <h2>Video Solution</h2>
                  <div className="video-container">
                    <iframe 
                      src={`https://www.youtube.com/embed/${ytVideoId}`} 
                      title="YouTube video player" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                      referrerPolicy="strict-origin-when-cross-origin" 
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
