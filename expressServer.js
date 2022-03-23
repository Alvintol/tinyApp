const express = require('express');
const { set, redirect, clearCookie } = require('express/lib/response');
const res = require('express/lib/response');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const users = require('./users');
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

generateRandomString = () => {
  const charList = "abcdefghijklmnopqrstuvwxyz0123456789"
  const randomID = [];
  while (randomID.length < 6) {
    randomID.push(charList[Math.floor(Math.random() * charList.length)]);
  }
  return randomID.join('');
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/login', (req, res) => {
  res.render('login');
})

app.post('/login', (req, res) => {
  if (req.body.username === '') {
    res.render('login');
    return;
  }
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  const randomID = generateRandomString();

  users[randomID] = {
    id: randomID,
    email: req.body.email,
    password: req.body.password,
  };
  console.log('New User Created:', users[randomID]);

  if (!users[randomID].password || !users[randomID].email) {
    return res.status(400).json({ msg: 'Please include password and email' })
  };
  res.cookie('user_id', randomID)
  res.redirect('urls');
});

app.get('/register', (req, res) => {
  res.render('register');
});

// app.get('/users/:id', (req, res) => {
//   for (const user in users) {
//     if (user == req.params.id) {
//       res.json(users[user])
//     } else {
//       res.status(400).json({ msg: `User ${req.params.id} not found` })
//     }
//   }
// });

// app.post('/users', (req, res) => {
//   const randomID = generateRandomString();
//   res.send(req.body);

// })

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
    urls: urlDatabase,
    users: users
  };
  console.log(users)
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

app.post("/urls", (req, res) => {
  const randomID = generateRandomString();
  urlDatabase[`${randomID}`] = req.body.longURL;
  const templateVars = {
    username: req.cookies['username'],
    shortURL: randomID,
    longURL: urlDatabase[randomID]
  };
  console.log('New URL stored: ', templateVars);
  res.render('urlsShow', templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listneing on port ${PORT}!`);
});