import puppeteer from "puppeteer";
import cheerio from "cheerio";

const scrapeMovieDetails = async (movieId: string) => {
  const browser = await puppeteer.launch({
    args: [
      "--disable-features=SameSiteByDefaultCookies,CookiesWithoutSameSiteMustBeSecure",
    ],
    headless: false,
  });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36"
  );
  await page.goto(`https://www.imdb.com/title/${movieId}`, {
    waitUntil: "networkidle2",
  });
  // await page.waitForSelector("[data-testid='Storyline']");
  await autoScroll(page);

  const htmlContent = await page.content();
  await browser.close();
  const $ = cheerio.load(htmlContent);

  const description = $("span[data-testid='plot-xl']").text();
  const metadata = $(".ipc-metadata-list-item__content-container");
  const directors = $(metadata[0])
    .find(".ipc-metadata-list-item__list-content-item")
    .map((i, element) => ({
      name: $(element).text(),
      nameId: $(element).attr("href")?.replace("/name/", "").split("/")[0],
    }))
    .get();
  const writers = $(metadata[1])
    .find(".ipc-metadata-list-item__list-content-item")
    .map((i, element) => ({
      name: $(element).text(),
      nameId: $(element).attr("href")?.replace("/name/", "").split("/")[0],
    }))
    .get();
  const stars = $(metadata[2])
    .find(".ipc-metadata-list-item__list-content-item")
    .map((i, element) => ({
      name: $(element).text(),
      nameId: $(element).attr("href")?.replace("/name/", "").split("/")[0],
    }))
    .get();
  const genres = $(".ipc-chip.ipc-chip--on-baseAlt")
    .map((i, element) => $(element).find(".ipc-chip__text").text())
    .get();
  const poster = $(".ipc-poster__poster-image img").attr("src");
  const storyline = $("[data-testid='Storyline']")
    .find(".ipc-html-content-inner-div")
    .contents()
    .filter(function () {
      return this.type === "text";
    })
    .text();
  const movieDetails = {
    description,
    directors,
    writers,
    stars,
    genres,
    poster,
    storyline,
  };

  console.log(movieDetails);
};

const main = () => {
  // scrapeTopMovies();
  scrapeMovieDetails("tt0111161");
};

main();
