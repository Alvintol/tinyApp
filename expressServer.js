const express = require('express');
const { set } = require('express/lib/response');
const res = require('express/lib/response');
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urlsIndex", templateVars);
});

app.get("/urls/new", (req, res) => { 
  res.render("urlsNew");
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: `${urlDatabase["b2xVn2"]}` };
  res.render('urlsShow', templateVars);
})

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

generateRandomString = () => {
  const charList = "abcdefghijklmnopqrstuvwxyz0123456789"
  const randomID = [];
  while (randomID.length < 6) {
    randomID.push(charList[Math.floor(Math.random() * charList.length)]);
  }
  return randomID.join('');
};

app.post("/urls", (req, res) => {
  console.log(req.body.longURL);  // Log the POST request body to the console 
  const randomID = generateRandomString();
  urlDatabase[`${randomID}`] = req.body.longURL;
  const templateVars = { shortURL: `${randomID}`, longURL: `${urlDatabase[randomID]}` };
  res.render('urlsShow', templateVars);
});



app.listen(PORT, () => {
  console.log(`Example app listneing on port ${PORT}!`);
});