const express = require('express');
const { set, redirect } = require('express/lib/response');
const res = require('express/lib/response');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const PORT = 8080;
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.use(morgan('dev'));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/login', (req, res) => {
  res.render('login');
})

validCookie = (req, res, next) => {
  const { cookies } = req;
  if ('username' in cookies) {
    next();
  } else {
    res.status(403).send({ERROR_403: 'Not Authenticated'})
  }
}

app.post('/login', validCookie, (req, res) => {
  const { cookies } = req;
  res.cookie('username', req.body.username);
  console.log(cookies)
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.render('login');
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", validCookie, (req, res) => {
  const templateVars = {
    username: req.cookies['username'],
    urls: urlDatabase
  };
  res.render("urlsIndex", validCookie, templateVars);
});

app.get("/urls/new", validCookie, (req, res) => {
  const templateVars = { username: req.cookies['username'] };
  res.render("urlsNew", templateVars);
});

app.get('/urls/:shortURL', validCookie, (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render('urlsShow', templateVars);
})

app.post('/urls/:shortURL/delete', validCookie, (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  console.log('URL Deleted: ', templateVars);
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
})


app.get("/u/:shortURL", validCookie, (req, res) => {
  const longURL = req.params.longURL;
  res.redirect(longURL);
});

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

app.post("/urls", validCookie, (req, res) => {
  const randomID = generateRandomString();
  urlDatabase[`${randomID}`] = req.body.longURL;
  const templateVars = {
    username: req.cookies["username"],
    shortURL: randomID,
    longURL: urlDatabase[randomID]
  };
  console.log('New URL stored: ', templateVars);
  res.render('urlsShow', templateVars);
});



app.listen(PORT, () => {
  console.log(`Example app listneing on port ${PORT}!`);
});