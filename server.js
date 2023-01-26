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
      compileRoute: (dir) => {
        console.log("h1", dir);
        const index = navArr.indexOf(dir);
        const copy = navArr;
        copy.length = index + 1;
        console.log(copy);
        return copy.join("/");
      },
    },
  })
);
app.set("view engine", "hbs");

let numOfFiles = 0;
let fileTab = [];
let extensions = ["png", "txt", "pdf", "mp4", "js", "jpg", "html"];
let curDir = "";
let destination = "home";
let navArr = [];

function readFiles(route) {
  fileTab = [];
  fs.readdir(__dirname + `/static/upload/${route}`, (err, files) => {
    files.forEach((element) => {
      let type = "";
      let ext = element.split(".")[element.split(".").length - 1];
      if (ext == element) {
        type = "dir";
      } else {
        type = "file";
      }
      fileTab.push({
        name: element,
        ext: ext,
        type: type,
        curDir: curDir,
        isFile: type == "file" ? true : false,
      });
      fileTab.sort(function (a, b) {
        if (a.type < b.type) {
          return -1;
        }
        if (a.type > b.type) {
          return 1;
        }
        return 0;
      });
    });
  });
}
readFiles("");
function checkIfExists(file) {
  let name = "";
  if (fs.existsSync(path.join(__dirname, "/static/upload/", file.name))) {
    if (file.type == "dir") {
      name = file.name + `-kopia-${Date.now()}`;
    } else {
      let nameArr = file.name.split(".");
      nameArr[nameArr.length - 2] =
        nameArr[nameArr.length - 2] + `-kopia-${Date.now()}`;
      name = nameArr.join(".");
    }
  } else {
    name = file.name;
  }
  return name;
}

app.get("/", function (req, res) {
  res.redirect("/filemanager");
});

app.get("/filemanager", function (req, res) {
  destination = req.query.name;
  let curDirarr,
    changeName = false;
  let navTab = [];
  if (destination) {
    curDir = destination;
    curDirarr = destination.split("/");
    curDirarr.forEach((el, i) => {
      navTab.push({ dir: el, curDir: curDirarr.slice(0, i).join("/") });
    });
    changeName = true;
  } else curDir = "";
  if (destination && destination.split(".").length > 1) {
    res.render("editor.hbs");
  } else {
    readFiles(curDir);
    res.render("filemanager.hbs", {
      curDir: curDir,
      nav: navTab,
      files: fileTab,
      renderChangeName: changeName,
    });
  }
});
app.get("/addDir", function (req, res) {
  const name = req.query.name;
  fs.mkdir(
    path.join(
      __dirname,
      "/static/upload/",
      curDir,
      checkIfExists({ name: name, type: "dir" })
    ),
    (err) => {
      if (err) throw err;
      // readFiles(curDir);
      res.redirect(`/filemanager?name=${curDir}`);
    }
  );
});
app.get("/addFile", function (req, res) {
  const name = req.query.name;

  fs.writeFile(
    path.join(
      __dirname,
      "/static/upload",
      curDir,
      checkIfExists({ name: name })
    ),
    "",
    (err) => {
      if (err) throw err;
      // readFiles(curDir);
      res.redirect(`/filemanager?name=${curDir}`);
    }
  );
});
app.get("/changeDirName", function (req, res) {
  const newName = req.query.name;
  const route = req.query.curDir;
  const cur = route.split("/");
  const arr = route.split("/");
  arr.pop();
  const r = arr.join("/");
  fs.rename(
    path.join(__dirname, "/static/upload/", route),
    path.join(
      __dirname,
      "/static/upload/",
      r,
      checkIfExists({ name: newName, type: "dir" })
    ),
    (err) => {
      if (err) console.log(err);
      else {
        console.log(r + newName);
        res.redirect(`/filemanager?name=${r + "/" + newName}`);
      }
    }
  );
});
app.post("/handleUpload", function (req, res) {
  var form = new formidable.IncomingForm();

  form.keepExtensions = true;
  form.multiples = true;
  form.uploadDir = __dirname + "/static/upload";

  form.on("file", function (field, file) {
    fs.rename(
      file.path,
      path.join(__dirname, "/static/upload/", curDir, checkIfExists(file)),
      (err) => {
        readFiles("");
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

app.get("/delete", function (req, res) {
  const name = req.query.name;
  const type = req.query.type;
  if (type == "dir") {
    // rimraf(path.join(__dirname, "/static/upload/", curDir, name), () => {
    //   readFiles("");

    //   res.redirect('/filemanager')
    // })
    fs.rmdir(
      path.join(__dirname, "/static/upload/", curDir, name),
      { recursive: true },
      (err) => {
        if (err) throw err;
        readFiles("");

        res.redirect("/filemanager");
      }
    );
  } else {
    fs.unlink(path.join(__dirname, "/static/upload/", curDir, name), (err) => {
      if (err) throw err;
      readFiles("");

      res.redirect("/filemanager");
    });
  }
});

// app.get("/show/", function (req, res) {
//   const id = req.query.id;
//   const index = fileTab.findIndex((file) => file.id == id);
//   res.sendFile(fileTab[index].path);
// });

// app.get("/download/", function (req, res) {
//   const id = req.query.id;
//   const index = fileTab.findIndex((file) => file.id == id);
//   res.download(fileTab[index].path);
// });
