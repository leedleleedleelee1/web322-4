/********************************************************************************
*  WEB322 – Assignment 06
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: _frank fu________________ Student ID: __126609197_____ Date: ___april 21 2024________
*
*  Published URL: https://awful-sandals-goat.cyclic.app 
*
********************************************************************************/
//ffu6 wbrb8YVZmi4gRgkF


const legoData = require("./modules/legoSets");
const authData = require("./modules/auth-service");
const express = require('express');
const clientSessions = require('client-sessions');
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(clientSessions({
  cookieName: "session", 
  secret: process.env.SESSION_SECRET || "defaultSessionSecret", 
  duration: 30 * 60 * 1000, 
  activeDuration: 5 * 60 * 1000
}));
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

app.get('/', (req, res) => {
  res.render("home");
});

app.get('/about', (req, res) => {
  res.render("about");
});

app.get("/lego/addSet", async (req, res) => {
  let themes = await legoData.getAllThemes()
  res.render("addSet", { themes: themes });
});

app.post("/lego/addSet", async (req, res) => {
  try {
    await legoData.addSet(req.body);
    res.redirect("/lego/sets");
  } catch (err) {
    res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
  }
});

app.get("/lego/editSet/:num", async (req, res) => {
  try {
    let set = await legoData.getSetByNum(req.params.num);
    let themes = await legoData.getAllThemes();
    res.render("editSet", { set, themes });
  } catch (err) {
    res.status(404).render("404", { message: err });
  }
});

app.post("/lego/editSet", async (req, res) => {
  try {
    await legoData.editSet(req.body.set_num, req.body);
    res.redirect("/lego/sets");
  } catch (err) {
    res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
  }
});

app.get("/lego/deleteSet/:num", async (req, res) => {
  try {
    await legoData.deleteSet(req.params.num);
    res.redirect("/lego/sets");
  } catch (err) {
    res.status(500).render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
  }
});

app.get("/lego/sets", async (req, res) => {
  try {
    let sets = await legoData.getAllSets();
    res.render("sets", { sets });
  } catch (err) {
    res.status(404).render("404", { message: err });
  }
});

app.get("/lego/sets/:num", async (req, res) => {
  try {
    let set = await legoData.getSetByNum(req.params.num);
    res.render("set", { set });
  } catch (err) {
    res.status(404).render("404", { message: err });
  }
});

app.get("/register", (req, res) => {
  res.render("register", { successMessage: '', errorMessage: '' });
});

app.post("/register", (req, res) => {
  authData.registerUser(req.body).then(() => {
      res.render("register", { successMessage: "User created", errorMessage: ''  });
  }).catch(err => {
    console.log(err);
      res.render("register", { successMessage: '', errorMessage: err });
    });
});
app.get("/login", (req, res) => {
  res.render("login", { userName: req.body.userName || '', errorMessage: '' });
});

app.post("/login", (req, res) => {
    req.body.userAgent = req.get('User-Agent');
    authData.checkUser(req.body).then(user => {
        req.session.user = {
            userName: user.userName,
            email: user.email,
            loginHistory: user.loginHistory
        };
        res.redirect('/lego/sets');
    }).catch(err => {
        res.render("login", { errorMessage: err, userName: req.body.userName });
    });
});

app.get("/logout", (req, res) => {
    req.session.reset();
    res.redirect('/');
});

app.use((req, res) => {
  res.status(404).render("404", { message: "I'm sorry, we're unable to find what you're looking for." });
});

legoData.initialize()
  .then(authData.initialize)
  .then(() => {
    app.listen(HTTP_PORT, () => console.log(`Server listening on: ${HTTP_PORT}`));
  })
  .catch(err => console.error('Unable to start the server:', err));
