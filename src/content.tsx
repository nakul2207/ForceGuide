import "./index.css";

import { createRoot } from "react-dom/client";
import { ContentPage } from "./content/ContentPage";

// Helper function to wait for an element
const waitForElement = (selector: string, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const interval = 100; // Check every 100ms
    let elapsed = 0;

    const check = () => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
      } else if (elapsed >= timeout) {
        reject(new Error(`Element with selector "${selector}" not found within ${timeout}ms`));
      } else {
        elapsed += interval;
        setTimeout(check, interval);
      }
    };

    check();
  });
};


waitForElement("#sidebar")
  .then((problemIndexHolder) => {
    // Create the container for the React app
    const root = document.createElement("div");
    root.id = "__codeforces_Guide_container";

    // Insert the React container at the end of the problemindexholder
    (problemIndexHolder as HTMLElement).prepend(root);

    // Mount the React app
    createRoot(root).render(
        <ContentPage />
    );
  })
  .catch((error) => {
    console.error(error.message);
  });
