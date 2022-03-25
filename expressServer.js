const express = require('express');
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const users = require('./data/users');
const urlDatabase = require('./data/urlDatabase');
const { getUserByEmail, generateRandomString, getDate } = require('./helpers');

const PORT = process.env.PORT || 8080;
const app = express();
const randomID = generateRandomString();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.use(morgan('dev'));
app.use(cookieSession({
  name: 'session',
  keys: ['icle', '13a(0/V', 'bits', 'test',],
  maxAge: 24 * 60 * 60 * 1000
}))


//GET / : HOME PAGE
app.get('/', (req, res) => req.session.user ? res.redirect('/urls') : res.render('login'));


//GET /urls : MAIN PAGE ONCE LOGGED IN
app.get("/urls", (req, res) => {
  const templateVars = {
    cookie: req.session.user,
    urls: urlDatabase,
    date: getDate()
  };
  if (req.session.user) {
    templateVars.email = users[req.session.user].email;
    return res.render("urlsIndex", templateVars);
  } else {
    return res.redirect('/404');
  };
});


//GET /urls/new : CREATE NEW SHORT URL LINK
app.get("/urls/new", (req, res) => {
  if (req.session.user) {
    const templateVars = {
      email: users[req.session.user].email,
      cookie: req.session.user,
    };
    return res.render("urlsNew", templateVars);
  };
  return res.redirect('/login');
});


//GET /urls/:id  : LOOK UP SPECIFIC URL
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    cookie: req.session.user,
    urls: urlDatabase,
    date: getDate()
  };
  if (!urlDatabase[req.params.shortURL] ||
    urlDatabase[req.params.shortURL].userID !== req.session.user) {
    return res.redirect('/lost');
  };
  templateVars.longURL = urlDatabase[req.params.shortURL].longURL
  templateVars.email = users[req.session.user].email;
  return res.render('urlsShow', templateVars);
});


//GET /u/:id  : REDIRECT TO CORRESPONDING URL  
app.get("/u/:shortURL", (req, res) => !urlDatabase[req.params.shortURL] ?
  res.redirect('/lost') :
  res.redirect(urlDatabase[req.params.shortURL].longURL));


// POST /urls  : STORES NEW URL TO LIST
app.post("/urls", (req, res) => {
  const templateVars = {
    email: users[req.session.user].email,
    shortURL: randomID,
    longURL: req.body.longURL,
    cookie: req.session.user,
    urls: urlDatabase,
  };
  if (req.session.user) {
    urlDatabase[`${randomID}`] = {
      shostURL: randomID,
      longURL: req.body.longURL,
      userID: req.session.user
    };
    console.log('New URL stored: ', {
      shortURL: templateVars.shortURL,
      longURL: templateVars.longURL,
      userID: req.session.user
    });
    return res.render('urlsShow', templateVars);
  } else {
    return res.redirect('/lost');
  };
});


//POST /urls/:id  : EXISTING URL EDIT ROUTE
app.post('/urls/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL].userID == req.session.user && req.session.user) {
    const templateVars = {
      email: users[req.session.user].email,
      shortURL: req.params.shortURL,
      longURL: req.body.longURL,
      cookie: req.session.user,
      urls: urlDatabase,
      date: getDate()
    };
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    return res.render('urlsIndex', templateVars);
  };
  return res.redirect('/urls');
});


//POST /urls/:id/delete  : DELETES EXISTING URLS IN LIST
app.post('/urls/:shortURL/delete', (req, res) => {
  if (urlDatabase[req.params.shortURL].userID == req.session.user && req.session.user) {
    const templateVars = {
      email: users[req.session.user].email,
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      urls: urlDatabase,
      cookie: req.session.user,
      date: getDate()
    };
    console.log('URL Deleted: ', { longURL: urlDatabase[req.params.shortURL].longURL });
    delete urlDatabase[req.params.shortURL];
    return res.render('urlsIndex', templateVars);
  };
  return res.redirect('/urls');
});


//GERT /login  : LOGIN PAGE
app.get('/login', (req, res) => req.session.user ? res.redirect('/urls') : res.render('login'));


//GET /register  : REGISTER PAGE
app.get('/register', (req, res) => {
  const templateVars = {
    cookie: req.session.user
  };
  req.session.user ? res.redirect('/urls') : res.render('register', templateVars);
});


//POST /login  : EXISTING LOGIN INPUT/ROUTE
app.post('/login', (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  const templateVars = {
    cookie: req.session.user
  };
  if (!user) {
    templateVars.header = 'Email not registered';
    return res.render('400', templateVars);
  };
  if (user && !bcrypt.compareSync(req.body.password, users[user].password)) {
    templateVars.header = 'Wrong Password! Please try again.';
    return res.render('400', templateVars)
  };
  req.session.user = users[user].id;
  console.log(`${user} just logged in`);
  return res.redirect('/urls');
});


//POST /register  : NEW REGISTRY INPUT/ROUTE
app.post('/register', (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  const templateVars = {
    urls: urlDatabase,
    cookie: req.session.user,
    email: req.body.email,
  };
  if (user) {
    templateVars.header = 'Email already registered';
    return res.render('400', templateVars);
  } else {
    users[randomID] = {
      id: randomID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10),
    };
    console.log('New User Created:', users[randomID]);
    req.session.user = users[randomID].id;
    templateVars.cookie = users[randomID].id;
    return res.render('urlsIndex', templateVars);
  };
});



// POST /logout  : LOGOUT ROUTE
app.post('/logout', (req, res) => {
  req.session = null;
  return res.render('login');
});


// LOST PAGE
app.get('/lost', (req, res) => {
  const templateVars = {
    shortURL: randomID,
    longURL: req.body.longURL,
    cookie: req.session.user,
    urls: urlDatabase,
  };
  if (req.session.user) {
    templateVars.email = users[req.session.user].email;
  };
  return res.render('lost', templateVars);
});


// CATCH ALL LOST PAGE
app.get('*', (req, res) => res.redirect('/lost'));


//SERVER STARTER
app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));