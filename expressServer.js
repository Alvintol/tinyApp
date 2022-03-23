const express = require('express');
const { set, redirect, clearCookie } = require('express/lib/response');
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

const users = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

// const validCookie = (req, res, next) => {
//   const { cookies } = req;
//   if (cookies) {
//     res.status(403).send({ERROR_403: 'Not Authenticated. Please login'});
//     next();
//   } else {
//     next();
//   }
// };

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/login', (req, res) => {
  res.render('login');
})

app.post('/login', (req, res) => {
  if (req.body.username === ''){
    res.render('login');
    return;
  }
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  res.render('register');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username', req.body.username);
  res.render('login');
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies['username'],
    urls: urlDatabase
  };
  res.render("urlsIndex", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies['username'] };
  res.render("urlsNew", templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render('urlsShow', templateVars);
});

app.post('/urls/edit/:shortURL', (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render('urlsEdit', templateVars)
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  console.log('URL Deleted: ', templateVars);
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
})


app.get("/u/:shortURL", (req, res) => {
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

app.post("/urls", (req, res) => {
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