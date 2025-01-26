import puppeteer from "puppeteer";
import { Request, Response } from "express";

export const search = async (req: Request, res: Response) => {
  const query = req.query.q as string;

  if (typeof query !== "string" || !query.trim()) {
    return res.status(400).json({ error: "Invalid or missing query parameter 'q'" });
  }

  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

  try {

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Wait for the first video link to load
    await page.waitForSelector('a#video-title');

    // Extract the first video link
    const videoId = await page.evaluate(() => {
      const videoElement = document.querySelector('a#video-title');
      return videoElement ? videoElement.getAttribute("href") : null;
    });

    await browser.close();

    if (videoId) {
      const cleanVideoId = videoId.split('v=')[1]?.split('&')[0];
      return res.json(cleanVideoId);
    } else {
      return res.status(404).json({ error: "No video found" });
    }
  } catch (err) {
    console.error("Error fetching YouTube results:", err);
    return res.status(500).json({ error: "Failed to fetch YouTube results" });
  }
};