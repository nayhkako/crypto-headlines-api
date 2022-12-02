const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const app = express();

const newspapers = [
  {
    name: "coindesk",
    url: "https://www.coindesk.com/tag/trading/",
    base: "https://www.coindesk.com",
  },
  {
    name: "cointelegraph",
    url: "https://cointelegraph.com/category/latest-news",
    base: "https://cointelegraph.com",
  },
  {
    name: "thenewscrypto",
    url: "https://thenewscrypto.com/news/",
    base: "",
  },
  {
    name: "moneycontrol",
    url: "https://www.moneycontrol.com/news/tags/cryptocurrency.html",
    base: "",
  },
  {
    name: "livemint",
    url: "https://www.livemint.com/market/cryptocurrency",
    base: "https://www.livemint.com",
  },
];

const jwt =
  "cTQx0PwBTBTX3upUABWLqRrDxxhmoMm37q2N3O4erMAe8RmSEfxVkDaRhwxINJ3INxZFDO02lWBUX7jRJi04DqAM38SObTCMUWOJ9FNvyFoQ071f3knE0XDgNNcQRVnk";

const articles = [];

newspapers.forEach((newspaper) => {
  axios.get(newspaper.url).then((response) => {
    const html = response.data;
    const $ = cheerio.load(html);
    var listItems = null;

    if (newspaper.name == "coindesk") {
      listItems = $(".gGbIdf");
    } else if (newspaper.name == "cointelegraph") {
      listItems = $(".post-card-inline__header");
    } else if (newspaper.name == "thenewscrypto") {
      listItems = $(".sm-header");
    } else if (newspaper.name == "moneycontrol") {
      listItems = $("h2");
    } else if (newspaper.name == "livemint") {
      listItems = $(".headline");
    }

    listItems.each((idx, el) => {
      // Object holding data for each newspaper
      const article = { title: "", url: "", source: "" };
      // Select the text content of a and href elements
      // Store the textcontent in the above object
      article.title = $(el).children("a").text();
      article.url = newspaper.base + $(el).children("a").attr("href");
      article.source = newspaper.name;
      articles.push(article);
    });
  });
});

app.get("/", (req, res) => {
  res.json("Welcome to Crypto Headlines News API");
});

app.get("/news", (req, res) => {
  if (jwt == req.headers["x-token-key"]) {
    res.json(articles);
  } else {
    res.status(401).send("Invalid Token");
  }
});

app.get("/news/:newsId", async (req, res) => {
  const newspaperArr = [
    { id: 1, name: "coindesk" },
    { id: 2, name: "cointelegraph" },
    { id: 3, name: "thenewscrypto" },
    { id: 4, name: "moneycontrol" },
    { id: 5, name: "livemint" },
  ];
  const newspaperId = req.params.newsId.toLowerCase();

  const containsNewspaperId = !!newspaperArr.find((arr) => {
    return arr.name === newspaperId;
  });

  console.log(containsNewspaperId);

  if (containsNewspaperId) {
    const newspaperAddress = newspapers.filter(
      (newspaper) => newspaper.name == newspaperId
    )[0].url;
    const newspaperBase = newspapers.filter(
      (newspaper) => newspaper.name == newspaperId
    )[0].base;

    axios
      .get(newspaperAddress)
      .then((response) => {
        const html = response.data;
        const $ = cheerio.load(html);

        var listItems = null;
        if (newspaperId == "coindesk") {
          listItems = $(".gGbIdf");
        } else if (newspaperId == "cointelegraph") {
          listItems = $(".post-card-inline__header");
        } else if (newspaperId == "thenewscrypto") {
          listItems = $(".sm-header");
        } else if (newspaperId == "moneycontrol") {
          listItems = $("h2");
        } else if (newspaperId == "livemint") {
          listItems = $(".headline");
        }

        if (listItems != null) {
          const specificArticles = [];

          listItems.each((idx, el) => {
            // Object holding data for each newspaper
            const article = { title: "", url: "", source: "" };
            // Select the text content of a and href elements
            // Store the textcontent in the above object
            article.title = $(el).children("a").text();
            article.url = newspaperBase + $(el).children("a").attr("href");
            article.source = newspaperId;
            specificArticles.push(article);
          });
          if (jwt == req.headers["x-token-key"]) {
            res.json(specificArticles);
          } else {
            res.status(401).send("Invalid Token");
          }
        } else {
          res.status(404).send("Not Found");
        }
      })
      .catch((err) => console.log(err));
  } else {
    res.status(404).send("Not Found");
  }
});

app.listen(process.env.PORT || 3000, function () {
  console.log(
    "Express server listening on port %d in %s mode",
    this.address().port,
    app.settings.env
  );
});
