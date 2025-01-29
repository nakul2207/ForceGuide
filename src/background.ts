// Type definitions for better type safety
interface SubmissionResponse {
  status: string;
  comment?: string;
  result: Array<{
    id: number;
    problem: {
      index: string;
    };
    programmingLanguage: string;
    verdict: string;
  }>;
}


// Background service worker
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle video search requests
  if (request.type === 'SEARCH_VIDEO') {
    handleVideoSearch(request.query, sendResponse);
    return true;
  }

  // Handle submission fetching
  if (request.type === 'FETCH_SUBMISSIONS') {
    handleSubmissionsFetch(request, sendResponse);
    return true;
  }

  // Handle problem info fetching - now uses current tab
  if (request.type === 'FETCH_PROBLEM_INFO') {
    if (!sender.tab?.id) {
      sendResponse({ error: 'No tab ID found' });
      return true;
    }
    
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id },
      func: () => {
        const problemName = document.querySelector(".problem-statement .title")?.textContent?.trim();
        const contestName = document.querySelector(".rtable a")?.textContent?.trim();
        return { problemName, contestName };
      }
    }).then(results => {
      if (!results || !results[0].result) {
        sendResponse({ error: 'Failed to parse problem information' });
        return;
      }

      const { problemName, contestName } = results[0].result;
      if (!problemName || !contestName) {
        sendResponse({ error: 'Failed to find problem information' });
        return;
      }

      sendResponse({
        problemName,
        contestName: `Codeforces ${contestName} ${problemName}`
      });
    }).catch(error => {
      console.error('Problem info error:', error);
      sendResponse({ error: error.message });
    });
    return true;
  }
});

// Handle video search through your server
async function handleVideoSearch(query: string, sendResponse: (response: any) => void) {
  try {
    const searchUrl = `${import.meta.env.VITE_SERVER_URL}/search?q=${encodeURIComponent(query)}`;
    const response = await fetch(searchUrl);
    const data = await response.json();
    sendResponse(data);
  } catch (error) {
    console.error('Video search error:', error);
    sendResponse({ error: 'Failed to fetch video' });
  }
}

// Handle Codeforces submissions fetch
async function handleSubmissionsFetch(
  request: { contestId: number; problemIndex: string; languagePrefix: string },
  sendResponse: (response: any) => void
) {
  try {
    const { contestId, problemIndex, languagePrefix } = request;
    const apiUrl = `https://codeforces.com/api/contest.status?contestId=${contestId}&from=1&count=5000`;
    
    const response = await fetch(apiUrl);
    const data = await response.json() as SubmissionResponse;

    if (data.status !== 'OK') {
      throw new Error(data.comment || 'Failed to fetch submissions');
    }

    const submissions = data.result
      .filter(submission => 
        submission.problem.index === problemIndex &&
        submission.programmingLanguage.toLowerCase().startsWith(languagePrefix) &&
        submission.verdict === 'OK'
      )
      .map(submission => submission.id)
      .slice(0, 5);

    sendResponse({ submissions });
  } catch (error) {
    console.error('Submissions fetch error:', error);
    sendResponse({ error: error instanceof Error ? error.message : 'Failed to fetch submissions' });
  }
}

// Listen for extension installation or update
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Extension installed');
  } else if (details.reason === 'update') {
    console.log('Extension updated');
  }
});
