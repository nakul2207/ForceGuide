import puppeteer from "puppeteer";
import { Request, Response } from "express";

export const search = async (req: Request, res: Response) => {
  const query = req.query.q as string;

  if (typeof query !== "string" || !query.trim()) {
    return res.status(400).json({ error: "Invalid or missing query parameter 'q'" });
  }

  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ]
    });
    const page = await browser.newPage();
    
    // Set a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Handle GDPR consent page if it appears
    try {
      const consentButtonSelector = 'button[aria-label="Accept the use of cookies and other data for the purposes described"]';
      await page.waitForSelector(consentButtonSelector, { timeout: 5000 });
      await page.click(consentButtonSelector);
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
    } catch (err) {
      // Consent page didn't appear, continue normally
    }

    // Wait for video results container (more reliable than direct link)
    await page.waitForSelector('ytd-video-renderer', { timeout: 30000 });

    // Extract the first video ID from the search results
    const videoId = await page.evaluate(() => {
      const videoLink = document.querySelector('ytd-video-renderer a#video-title') as HTMLAnchorElement;
      return videoLink ? videoLink.href.split('v=')[1]?.split('&')[0] : null;
    });

    await browser.close();

    if (videoId) {
      return res.json(videoId);
    } else {
      return res.status(404).json({ error: "No video found" });
    }
  } catch (err) {
    console.error("Error fetching YouTube results:", err);
    return res.status(500).json({ error: "Failed to fetch YouTube results" });
  }
};