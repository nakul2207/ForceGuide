import { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('C++');
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [languages] = useState<string[]>([
    'C++', 
    'Python',        
    'Java',                  
    'C#',                        
    'Ruby',           
    'Go',                      
    'Kotlin',       
    'JavaScript' 
  ]);

  useEffect(() => {
    // Load the previously selected language from Chrome storage
    chrome.storage.local.get(['selectedLanguage'], (result) => {
      if (result.selectedLanguage) {
        setSelectedLanguage(result.selectedLanguage);
      }
    });
  }, []);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const language = e.target.value;
    setSelectedLanguage(language);
  };

  const saveToStorage = () => {
    console.log(selectedLanguage)
    chrome.storage.local.set({selectedLanguage }, () => {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        window.close();
      }, 500);
      
      // Query for the Codeforces tab and reload it
      chrome.tabs.query({ url: "*://*.codeforces.com/*" }, (tabs) => {
        tabs.forEach((tab) => {
          if (tab.id) {
            chrome.tabs.reload(tab.id);
          }
        });
      });
    });
  };

  return (
    <div className="popup-container">
      <div className="header">
        <h1 className="app-name">ForceGuide</h1>
        <p className="creator">Created by Nakul</p>
      </div>
      <div className="content">
        <h2 className="popup-title">Preferred Language</h2>
        <div className="select-wrapper">
          <select
            value={selectedLanguage}
            onChange={handleLanguageChange}
            className="language-dropdown"
          >
            {languages.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </div>
        <p className="selected-language">
          Currently selected: <span>{selectedLanguage}</span>
        </p>
        <button className="save-button" onClick={saveToStorage}>
          Save Changes
        </button>
        {showSuccess && (
          <div className="success-message">
            Language saved successfully!
          </div>
        )}
      </div>
    </div>
  );
};

export default App;