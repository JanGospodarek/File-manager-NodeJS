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
    helpers: {
      renderImg: (name) => {
        let ext = name.split(".")[name.split(".").length - 1];
        console.log(extensions.indexOf(ext), ext);
        if (extensions.indexOf(ext.toLowerCase()) == -1) {
          ext = "file";
        }
        return `<img src="img/${ext}.png" alt="Rozszerzenie ${ext}"/>`;
      },
    },
  })
);
console.log(path);
app.set("view engine", "hbs");
let numOfFiles = 0;
let fileTab = [];
let extensions = ["png", "txt", "pdf", "mp4", "js", "jpg", "html"];
app.get("/", function (req, res) {
  res.redirect("/filemanager");
});
fs.readdir(__dirname + '/static/upload', (err, files) => {
  console.log(files);
  files.forEach(element => {
    fileTab.push({ name: element })
  });
})
// app.get("/upload", function (req, res) {
//   res.render("upload.hbs");
// });
app.get("/filemanager", function (req, res) {
  res.render("filemanager.hbs", { files: fileTab });
});

// app.get("/show/", function (req, res) {
//   const id = req.query.id;
//   const index = fileTab.findIndex((file) => file.id == id);
//   res.sendFile(fileTab[index].path);
// });
// app.get("/info/", function (req, res) {
//   const id = req.query.id;
//   if (!id)
//     res.render("info.hbs", {
//       id: "nie podano",
//       name: "nie podano",
//       path: "nie podano",
//       size: "nie podano",
//       type: "nie podano",
//       savedate: "nie podano",
//     });
//   else {
//     const index = fileTab.findIndex((file) => file.id == id);
//     const el = fileTab[index];
//     res.render("info.hbs", {
//       id: el.id,
//       name: el.name,
//       path: el.path,
//       size: el.size,
//       type: el.type,
//       savedate: el.savedate,
//     });
//   }
// });
// app.get("/download/", function (req, res) {
//   const id = req.query.id;
//   const index = fileTab.findIndex((file) => file.id == id);
//   res.download(fileTab[index].path);
// });
// app.get("/delete/", function (req, res) {
//   const id = req.query.id;
//   const index = fileTab.findIndex((file) => file.id == id);
//   fileTab.splice(index, 1);
//   res.redirect("/filemanager");
// });
// app.get("/deleteAll", function (req, res) {
//   fileTab = [];
//   res.redirect("/filemanager");
// });
app.post("/handleUpload", function (req, res) {
  let form = formidable({});
  form.keepExtensions = true;
  form.multiples = true;
  form.uploadDir = __dirname + "/static/upload/";

  form.parse(req, function (err, fields, files) {
    if (files.upload.length > 0) {
      files.upload.forEach((file) => {
        numOfFiles += 1;
        fileTab.push({
          id: numOfFiles,
          path: file.path,
          savedate: Math.round(new Date().getTime() / 1000),
        });
      });

    } else {
      numOfFiles += 1;

      fileTab.push({
        id: numOfFiles,
        name: files.upload.name,
        path: files.upload.path,
        savedate: Math.round(new Date().getTime() / 1000),
      });
    }

    res.render("filemanager.hbs", { files: fileTab });
  });
});

app.listen(PORT, function () {
  console.log("start serwera na porcie " + PORT);
});
