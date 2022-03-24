const express = require('express');
const { set, redirect, clearCookie } = require('express/lib/response');
const res = require('express/lib/response');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const users = require('./users');
const PORT = process.env.PORT || 8080;
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

app.post('/login', (req, res, next) => {
  const randomID = generateRandomString();
  console.log(req.body);
  for (const user in users) {
   if (users[user].email == req.body.email && req.body.password !== users[user].password) {
      return res.status(403).json({ msg: 'Entered Wrong Password' })
    }
    else if (users[user].email == req.body.email) {
      const templateVars = {
        id: randomID,
        email: users[user].email,
        urls: urlDatabase
      }
      res.cookie('userCookie', user);
      console.log(`${users[user].email} just logged in`, req.body);
      res.render('urlsIndex', templateVars);
      return;
    } 
  }return res.status(404).json({ ERROR_404: 'Email not registered' });
});

app.post('/register', (req, res) => {
  const randomID = generateRandomString();

  users[randomID] = {
    id: randomID,
    email: req.body.email,
    password: req.body.password,
  };
  console.log('New User Created:', users[randomID]);

  const templateVars = {
    email: req.body.email,
    urls: urlDatabase,
  }

  if (!users[randomID].password || !users[randomID].email) {
    return res.status(400).json({ ERROR_400: 'Please include password and email' })
  };
  for (const user in users) {
    if (users[user].email == req.body.email) {
      return res.status(400).json({ ERROR_400: 'Email already registered' })
    } else {
      res.cookie('userCookie', randomID)
      res.render('urlsIndex', templateVars);
    }
  }
});

app.get('/register', (req, res) => {
  res.render('register');
});


app.post('/logout', (req, res) => {
  res.clearCookie('userCookie', req.body.userCookie);
  res.render('login');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    email: users[req.cookies.userCookie].email,
    urls: urlDatabase,
  };
  console.log('REQ:', req);
  res.render("urlsIndex", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    email: users[req.cookies.userCookie].email
  };
  console.log('USERS:', users)
  // console.log('REQ:', req)
  console.log('COOKIE:', req.cookies.userCookie)

  res.render("urlsNew", templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    email: users[req.cookies.userCookie].email,
  };
  // for (const user in users) {}
  res.render('urlsShow', templateVars);
});

app.post('/urls/edit/:shortURL', (req, res) => {
  const templateVars = {
    email: users[req.cookies.userCookie].email,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]

  };
  res.render('urlsEdit', templateVars)
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const templateVars = {
    email: users[req.cookies.userCookie].email,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    urls: urlDatabase
  };
  console.log('URL Deleted: ', templateVars);
  delete urlDatabase[req.params.shortURL];
  res.render('urlsIndex', templateVars);
})

app.get("/u/:shortURL", (req, res) => {
  const longURL = req.params.longURL;
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const randomID = generateRandomString();
  urlDatabase[`${randomID}`] = req.body.longURL;

  const templateVars = {
    email: users[req.cookies.userCookie].email,
    shortURL: randomID,
    longURL: urlDatabase[randomID]
  };
  console.log('REQ:', req)
  console.log('New URL stored: ', { shortURL: templateVars.shortURL, longURL: templateVars.longURL });
  res.render('urlsShow', templateVars);
});

app.get('*', (req, res) => {
  return res.status(404).send({ ERROR_404: 'Page non-exist' })
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});