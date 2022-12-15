
const express = require("express")
const app = express()
const PORT = 3000;
const path = require("path")
const hbs = require('express-handlebars');
const formidable = require('formidable');
const fs = require("fs")
app.use(express.static('static'))
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', hbs({
    defaultLayout: 'main.hbs', helpers: {
        renderImg: (name) => {
            const ext = name.split('.')[1]
            return ext
        }
    }
}));
app.set('view engine', 'hbs');
let numOfFiles = 0
const fileTab = []

app.get("/", function (req, res) {
    res.render('upload.hbs');
})
app.get("/upload", function (req, res) {
    res.render('upload.hbs');
})
app.get("/filemanager", function (req, res) {
    res.render('filemanager.hbs', { files: fileTab });
})
app.get("/show/", function (req, res) {
    const id = req.query.id
    const index = fileTab.findIndex((file) => file.id == id)
    console.log(fileTab[index]);
    res.sendFile(fileTab[index].path)
})
app.post('/handleUpload', function (req, res) {

    let form = formidable({});
    form.keepExtensions = true
    form.multiples = true
    form.uploadDir = __dirname + '/static/upload/'       // folder do zapisu zdjęcia

    form.parse(req, function (err, fields, files) {
        if (files.upload.length > 0) {
            files.upload.forEach((file) => {
                numOfFiles += 1
                fileTab.push({ id: numOfFiles, name: file.name, size: file.size, type: file.type, path: file.path })
            })
        } else {
            numOfFiles += 1

            fileTab.push({ id: numOfFiles, name: files.upload.name, size: files.upload.size, type: files.upload.type, path: files.upload.path })
        }

        console.log(files.upload);
        res.render('filemanager.hbs', { files: fileTab })
    });
});

app.listen(PORT, function () {
    console.log("start serwera na porcie " + PORT)
})
