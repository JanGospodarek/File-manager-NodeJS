
const express = require("express")
const app = express()
const PORT = 3000;
const path = require("path")
const fs = require("fs")
const hbs = require('express-handlebars');

app.use(express.static('static'))
app.use(express.static('static/cwiczenia'))
app.use(express.static('static/cwiczenia/cw1'))
app.use(express.static('static/cwiczenia/cw2'))

app.set('views', path.join(__dirname, 'static/views'));
app.engine('hbs', hbs({ defaultLayout: 'main.hbs' }));
app.set('view engine', 'hbs');

app.get("/", function (req, res) {

    fs.readdir('static/cwiczenia', function (err, files) {
        if (err) {
            return console.log(err);
        }
        let ctx = {}
        files.forEach((dir) => {
            fs.readdir(`static/cwiczenia/${dir}`, (err, filesSmall) => {

                if (err) {
                    return console.log(err);
                }
                if (dir == 'cw1')
                    ctx.files1 = filesSmall
                if (dir == 'cw2') {
                    ctx.files2 = filesSmall
                    if (ctx.files2 && ctx.files1)
                        res.render('index.hbs', ctx)

                }


            })
        })


    });
})

app.listen(PORT, function () {
    console.log("start serwera na porcie " + PORT)
})