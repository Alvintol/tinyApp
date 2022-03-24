const express = require('express');
const { set, redirect, clearCookie, get } = require('express/lib/response');
const res = require('express/lib/response');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const users = require('./data/users');
const urlDatabase = require('./data/urlDatabase');
const PORT = process.env.PORT || 8080;
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.use(morgan('dev'));
app.use(cookieParser());

generateRandomString = () => {
  const charList = "abcdefghijklmnopqrstuvwxyz0123456789"
  const randomID = [];
  while (randomID.length < 6) {
    randomID.push(charList[Math.floor(Math.random() * charList.length)]);
  }
  return randomID.join('');
};

app.get('/', (req, res) => {
  if (req.cookies.userCookie) {
    res.redirect('/urls');
  } else {
    res.render('login');
  }
}
);

app.get('/login', (req, res) => {
  if (req.cookies.userCookie) {
    return res.redirect('/urls');
  }else {
    res.render('login');
  }
})

app.post('/login', (req, res, next) => {
  const randomID = generateRandomString();
  for (const user in users) {
  if (users[user].email == req.body.email && !bcrypt.compareSync(req.body.password, users[user].password)) {
      return res.status(403).json({ msg: 'Entered Wrong Password' })
    }
    else if (users[user].email == req.body.email &&bcrypt.compareSync(req.body.password, users[user].password)) {
      const templateVars = {
        id: randomID,
        email: users[user].email,
        urls: urlDatabase,
        cookie: req.cookies.userCookie
      }
      res.cookie('userCookie', user);
      console.log(`${users[user].email} just logged in`);
      res.redirect('/urls');
      return;
    }
  } return res.status(404).json({ ERROR_404: 'Email not registered' });
});

app.post('/logout', (req, res) => {
  res.clearCookie('userCookie', req.body.userCookie);
  res.render('login');
});

app.post('/register', (req, res) => {
  const randomID = generateRandomString();

  users[randomID] = {
    id: randomID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10),
  };
  console.log('New User Created:', users[randomID]);

  const templateVars = {
    email: req.body.email,
    urls: urlDatabase,
    cookie: req.cookies.userCookie
  }

  if (!users[randomID].password || !users[randomID].email) {
    return res.status(400).json({ ERROR_400: 'Please include password and email' })
  };
  for (const user in users) {
    if (users[user].email == req.body.email) {
      return res.status(400).json({ ERROR_400: 'Email already registered' })
    } else {
      res.cookie('userCookie', randomID)
      return res.render('urlsIndex', templateVars);
    }
  }
});

app.get('/register', (req, res) => {
  if (req.cookies.userCookie) {
    return res.redirect('/urls');
  }
  res.render('register');
});

app.get("/urls/new", (req, res) => {
  if (req.cookies.userCookie) {
    const templateVars = {
      email: users[req.cookies.userCookie].email,
    };
    return res.render("urlsNew", templateVars);
  }
  return res.redirect('/urls');
});

app.get('/urls/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL].userID == req.cookies.userCookie) {
    const templateVars = {
      email: users[req.cookies.userCookie].email,
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL
    };
    return res.render('urlsShow', templateVars);
  }
  return res.redirect('/urls');
});

app.post('/urls/edit/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL].userID == req.cookies.userCookie) {
    const templateVars = {
      email: users[req.cookies.userCookie].email,
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL
    };
    return res.render('urlsEdit', templateVars);
  }
  return res.redirect('/urls');
});

app.post('/urls/:shortURL/delete', (req, res) => {
  if (urlDatabase[req.params.shortURL].userID == req.cookies.userCookie) {
    const templateVars = {
      email: users[req.cookies.userCookie].email,
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      urls: urlDatabase,
      cookie: req.cookies.userCookie
    };
    console.log('URL Deleted: ', { longURL: urlDatabase[req.params.shortURL].longURL });
    delete urlDatabase[req.params.shortURL];
    return res.render('urlsIndex', templateVars);
  } else {
    return res.redirect('/urls');
  }
})

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls", (req, res) => {
  if (req.cookies.userCookie) {
    const templateVars = {
      email: users[req.cookies.userCookie].email,
      cookie: req.cookies.userCookie,
      urls: urlDatabase,
    };
    return res.render("urlsIndex", templateVars);
  }
  return res.redirect('/login');
});

app.post("/urls", (req, res) => {
  if (req.cookies.userCookie) {
    const randomID = generateRandomString();
    urlDatabase[`${randomID}`] = {
      shostURL: randomID,
      longURL: req.body.longURL,
      userID: req.cookies.userCookie
    };
    const templateVars = {
      email: users[req.cookies.userCookie].email,
      shortURL: randomID,
      longURL: req.body.longURL,
      cookie: req.cookies.userCookie,
      urls: urlDatabase
    };
    console.log('New URL stored: ', {
      shortURL: templateVars.shortURL,
      longURL: templateVars.longURL,
      userID: req.cookies.userCookie
    });
    res.render('urlsShow', templateVars);
  } else {
    res.redirect('/login')
  }
});

app.get('*', (req, res) => {
  return res.status(404).send({ ERROR_404: 'Page non-exist' })
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});