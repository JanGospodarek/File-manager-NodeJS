const express = require("express");
const app = express();
const PORT = 3000;
const path = require("path");
const hbs = require("express-handlebars");
const formidable = require("formidable");
const fs = require("fs");
app.use(express.static("static"));
app.set("views", path.join(__dirname, "views"));
app.engine(
    "hbs",
    hbs({
        defaultLayout: "main.hbs",
    })
);
app.set("view engine", "hbs");

app.get("/", function (req, res) {
    res.render("upload.hbs");
});




app.listen(PORT, function () {
    console.log("start serwera na porcie " + PORT);
});
