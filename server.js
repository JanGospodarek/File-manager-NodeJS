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
        if (ext === name) {
          ext = "folder";
        } else if (extensions.indexOf(ext.toLowerCase()) == -1) {
          ext = "file";
        }
        return `<img src="img/${ext}.png" alt="Rozszerzenie ${ext}"/>`;
      },
    },
  })
);
app.set("view engine", "hbs");

let numOfFiles = 0;
let fileTab = [];
let extensions = ["png", "txt", "pdf", "mp4", "js", "jpg", "html"];

function readFiles() {
  fileTab = [];
  fs.readdir(__dirname + "/static/upload", (err, files) => {
    files.forEach((element) => {
      let type = "";
      let ext = element.split(".")[element.split(".").length - 1];
      if (ext == element) {
        type = "dir";
      } else {
        type = "file";
      }
      fileTab.push({ name: element, ext: ext, type: type });
    });
  });
}
readFiles();
function checkIfExists(file) {
  let name = "";
  if (fs.existsSync(path.join(__dirname, "/static/upload/", file.name))) {
    if (file.type == "dir") {
      name = file.name + `-kopia-${Date.now()}`;
    } else {
      let nameArr = file.name.split(".");
      nameArr[nameArr.length - 2] =
        nameArr[nameArr.length - 2] + `-kopia-${Date.now()}`;
      // nameArr.splice(nameArr.length - 1, 0, `-kopia-${Date.now()}`);
      name = nameArr.join(".");
    }
  } else {
    name = file.name;
  }
  return name;
}
// app.get("/upload", function (req, res) {
//   res.render("upload.hbs");
// });

app.get("/", function (req, res) {
  res.redirect("/filemanager");
});

app.get("/filemanager", function (req, res) {
  res.render("filemanager.hbs", { files: fileTab });
});
app.get("/addDir", function (req, res) {
  const name = req.query.name;
  console.log(checkIfExists({ name: name }));
  fs.mkdir(
    path.join(
      __dirname,
      "/static/upload/",
      checkIfExists({ name: name, type: "dir" })
    ),
    (err) => {
      if (err) throw err;
      readFiles();
      res.redirect("/filemanager");
    }
  );
});
app.get("/addFile", function (req, res) {
  const name = req.query.name;

  fs.writeFile(
    path.join(__dirname, "/static/upload", checkIfExists({ name: name })),
    "",
    (err) => {
      if (err) throw err;
      readFiles();
      res.redirect("/filemanager");
    }
  );
});
app.post("/handleUpload", function (req, res) {
  var form = new formidable.IncomingForm();
  // form.keepFilenames = true;

  form.keepExtensions = true;
  form.multiples = true;
  form.uploadDir = __dirname + "/static/upload";

  form.on("file", function (field, file) {
    //rename the incoming file to the file's name

    fs.rename(
      file.path,
      path.join(__dirname, "/static/upload/", checkIfExists(file)),
      (err) => {
        readFiles();
      }
    );
  });
  form.parse(req, function () {
    res.redirect("/filemanager");
  });
});

app.listen(PORT, function () {
  console.log("start serwera na porcie " + PORT);
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
app.get("/delete", function (req, res) {
  const name = req.query.name;
  const type = req.query.type;
  console.log(name, type);
  if (type == "dir") {
    fs.rmdir(path.join(__dirname, "/static/upload/", name), (err) => {
      if (err) throw err;
      console.log("nie ma ");
    });
  } else {
    fs.unlink(path.join(__dirname, "/static/upload/", name), (err) => {
      if (err) throw err;
    });
  }
  readFiles();

  res.redirect("/filemanager");
});
// app.get("/deleteAll", function (req, res) {
//   fileTab = [];
//   res.redirect("/filemanager");
// });
