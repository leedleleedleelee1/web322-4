/********************************************************************************
*  WEB322 – Assignment 04
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: ____Frank Fu______________ Student ID: ___126609197____ Date: _______Mar 21 2024_______
*
*  Published URL: https://awful-sandals-goat.cyclic.app
********************************************************************************/


const express = require("express");
const legoData = require("./modules/legoSets");

const app = express();
app.set('view engine', 'ejs');

app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));

const HTTP_PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.render("home");
});

app.get('/about', (req, res) => {
    res.render("about");
});

app.get('/lego/sets', async (req, res) => {
    try {
        const theme = req.query.theme;
        let sets = theme ? await legoData.getSetsByTheme(theme) : await legoData.getAllSets();

        if (sets.length === 0) {
            return res.status(404).render("404", {message: "Unable to find requested sets."});
        }

        res.render("sets", {sets: sets});
    } catch (err) {
        res.status(500).render("500", {message: "An unexpected error occurred."});
    }
});

app.get('/lego/sets/:setNum', async (req, res) => {
    try {
        const setNum = req.params.setNum;
        let set = await legoData.getSetByNum(setNum);

        if (!set) {
            return res.status(404).render("404", {message: "Unable to find requested set."});
        }

        res.render("set", {set: set});
    } catch (err) {
        res.status(500).render("500", {message: "An unexpected error occurred."});
    }
});

app.get('/lego/addSet', (req, res) => {
    legoData.getAllThemes().then((themes) => {
        res.render('addSet', { themes: themes });
    }).catch((err) => {
        res.render('500', { message: err });
    });
});

app.post('/lego/addSet', (req, res) => {
    legoData.addSet(req.body).then(() => {
        res.redirect('/lego/sets');
    }).catch((err) => {
        console.log(err);
        res.render('500', { message: `Failed to add new set: ${err.toString()}` });
    });
});

app.get('/lego/editSet/:setNum', async (req, res) => {
    try {
        const setNum = req.params.setNum;
        const set = await legoData.getSetByNum(setNum);
        const themes = await legoData.getAllThemes();
        if (set) {
            res.render('editSet', { set: set, themes: themes });
        } else {
            res.status(404).render('404', { message: "Set not found." });
        }
    } catch (err) {
        res.status(500).render('500', { message: err.message });
    }
});
app.post('/lego/editSet', async (req, res) => {
    try {
        await legoData.updateSet(req.body.set_num, req.body);
        res.redirect('/lego/sets');
    } catch (err) {
        res.status(500).render('500', { message: `Failed to update set: ${err.message}` });
    }
});
app.get('/lego/deleteSet/:setNum', (req, res) => {
    const setNum = req.params.setNum;
    legoData.deleteSet(setNum)
        .then(() => {
            res.redirect('/lego/sets');
        })
        .catch(err => {
            res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
        });
});

legoData.initialize().then(() => {
    app.listen(HTTP_PORT, () => {
        console.log(`Server listening on: ${HTTP_PORT}`);
    });
});

app.use((req, res) => {
    res.status(404).render("404", {message: "Page not found."});
});
