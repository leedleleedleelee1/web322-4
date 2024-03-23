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
*  Published URL: https://different-smock-ray.cyclic.app/
********************************************************************************/


const express = require("express");
const legoData = require("./modules/legoSets");

const app = express();
app.set('view engine', 'ejs');
const HTTP_PORT = process.env.PORT || 3000;
app.use(express.static("public"));

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
        res.status(500).render("404", {message: "An unexpected error occurred."});
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
        res.status(500).render("404", {message: "An unexpected error occurred."});
    }
});

legoData.initialize().then(() => {
    app.listen(HTTP_PORT, () => {
        console.log(`Server listening on: ${HTTP_PORT}`);
    });
});

app.use((req, res) => {
    res.status(404).render("404", {message: "I'm sorry, we're unable to find what you're looking for."});
});
