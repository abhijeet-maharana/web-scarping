import puppeteer from "puppeteer";
import cheerio from "cheerio";

export const scrapeTopMovies = async () => {
  const browser = await puppeteer.launch({
    args: [
      "--disable-features=SameSiteByDefaultCookies,CookiesWithoutSameSiteMustBeSecure",
    ],
    headless: true,
  });
  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36"
  );

  await page.goto("https://www.imdb.com/chart/top", {
    waitUntil: "networkidle2",
  });

  const htmlContent = await page.content();

  await browser.close();

  const $ = cheerio.load(htmlContent);

  const list = $(".ipc-metadata-list-summary-item");
  const movies = list
    .map((index, element) => {
      const [movieOrder, title] = $(element)
        .find(".ipc-title__text")
        .text()
        .split(". ");
      const movieId = $(element)
        .find(".ipc-title-link-wrapper")
        .attr("href")
        ?.replace("/title/", "")
        .split("/")[0];
      const link = `/title/${movieId}`;
      const metadata = $(element).find(".cli-title-metadata span");
      const rating = $(element)
        .find(".ipc-rating-star")
        .contents()
        .filter(function () {
          return this.type === "text";
        })
        .text();
      const numberOfratings = $(element)
        .find(".ipc-rating-star--voteCount")
        .contents()
        .filter(function () {
          return this.type === "text";
        })
        .text()
        .trim();
      return {
        movieOrder,
        title,
        movieId,
        link,
        year: $(metadata[0]).text(),
        duration: $(metadata[1]).text(),
        rated: $(metadata[2]).text(),
        rating,
        numberOfratings,
      };
    })
    .get();
  console.log({ movies });
};
