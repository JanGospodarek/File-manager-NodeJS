const express = require("express");
const app = express();
const PORT = 3000;
const path = require("path");
const hbs = require("express-handlebars");
const formidable = require("formidable");
const fs = require("fs");
const cookieparser = require("cookie-parser");
const nocache=require('nocache')
app.use(express.static("static"));
app.use(cookieparser())
app.use(nocache())
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
        const index = navArr.indexOf(dir);
        const copy = navArr;
        copy.length = index + 1;
        return copy.join("/");
      },
    },
  })
);
app.set("view engine", "hbs");
app.use(express.json());

let rawdata = fs.readFileSync("static/data/data.json");
let defaultFiles = JSON.parse(rawdata);
let fileTab = [];
let extensions = ["png", "txt", "pdf", "mp4", "js", "jpg", "html"];
let curDir = "";
let destination = "";
let navArr = [];
const effects = [
  {
    name: "grayscale",
    imagePath: "/img/gamut.jpg",
  },
  { name: "invert", imagePath: "/img/gamut.jpg" },
  { name: "sepia", imagePath: "/img/gamut.jpg" },
];
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
  let r = "";
  console.log(file.route);
  if (file.route) r = file.route;
  console.log(
    fs.existsSync(path.join(__dirname, "/static/upload/", r, file.name)),
    path.join(__dirname, "/static/upload/", r, file.name)
  );
  if (fs.existsSync(path.join(__dirname, "/static/upload/", r, file.name))) {
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
    fs.readFile(
      path.join(__dirname, "/static/upload", curDir.split("?")[0]),
      "utf8",
      (err, data) => {
        if (err) {
          console.error(err);
          return;
        }
        const ext = curDir.split("?")[0].split(".")[curDir.split("?").length];
        if (["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext)) {
          res.render("imgEditor.hbs", {
            name: destination.split("?")[0],
            content: data,
            effects: effects,
          });
        } else {
          res.render("editor.hbs", {
            name: destination.split("?")[0],
            content: data,
          });
        }
      }
    );
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
  if (name.split(".").length > 1) {
    res.send(
      "Błąd nazwy, (nazwa nie może zawierać kropek i innych znaków specjalnych)!"
    );
    return;
  }

  fs.mkdir(
    path.join(
      __dirname,
      "/static/upload/",
      curDir,
      checkIfExists({ name: name, type: "dir" })
    ),
    (err) => {
      if (err) throw err;

      res.redirect(`/filemanager?name=${curDir}`);
    }
  );
});

app.get("/addFile", function (req, res) {
  const name = req.query.name;
  const ext = name.split(".")[name.split(".").length - 1];
  if (ext == name) {
    res.send("Brak rozszerzenia!");
    return;
  }
  const fileContent = defaultFiles[ext] ? defaultFiles[ext] : "";
  fs.writeFile(
    path.join(
      __dirname,
      "/static/upload",
      curDir,
      checkIfExists({ name: name, route: curDir })
    ),
    fileContent,
    (err) => {
      if (err) throw err;

      res.redirect(`/filemanager?name=${curDir}`);
    }
  );
});

app.get("/changeName", function (req, res) {
  const newName = req.query.name.trim();
  const route = req.query.curDir;
  console.log(newName, route);
  if (newName.length == 0) {
    res.send("Błąd nazwy, (nie może być pusta)");
    return;
  }
  let type;
  if (route.split(".").length > 1) type = "file";
  else type = "dir";

  if (newName.split(".").length > 1 && type == "dir") {
    res.send(
      "Błąd nazwy, (nazwa nie może zawierać kropek i innych znaków specjalnych)!"
    );
    return;
  }
  if (newName.split(".").length < 1 && type == "file") {
    res.send("Błąd nazwy, (nazwa musi zawieraćrozszerzenie)!");
    return;
  }
  const arr = route.split("/");
  arr.pop();
  const r = arr.join("/");
  console.log(type);
  const compiledName = checkIfExists({
    name: newName,
    type: type,
    route: r,
  });
  console.log("basic:", route, "new", r, compiledName);
  fs.rename(
    path.join(__dirname, "/static/upload/", route),
    path.join(__dirname, "/static/upload/", r, compiledName),
    (err) => {
      if (err) console.log(err);
      else {
        res.redirect(`/filemanager?name=${r + "/" + compiledName}`);
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

app.get("/delete", function (req, res) {
  const name = req.query.name;
  const type = req.query.type;
  if (type == "dir") {
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

app.get("/getConfig", function (req, res) {
  let rawdata2 = fs.readFileSync("config/config.json");
  let config = JSON.parse(rawdata2);
  res.send(config);
});

app.post("/saveConfig", function (req, res) {
  const data = JSON.stringify(req.body);
  fs.writeFile(path.join(__dirname, "config/config.json"), data, (err) => {
    if (err) throw err;
  });
});

app.post("/saveFile", function (req, res) {
  const route = req.body.route.split("?")[0];
  const value = req.body.value;
  const imgData = req.body.dataUrl;
  if (value)
    fs.writeFile(
      path.join(__dirname, "/static/upload", route),
      value,
      (err) => {
        if (err) throw err;
      }
    );
  else {
    const data = imgData.split(",")[1];
    const buffer = Buffer.from(data, "base64");
    console.log(data);
    fs.writeFileSync(path.join(__dirname, "/static/upload", route), buffer);
  }
});
app.get("/showFile", function (req, res) {
  const route = req.query.name;
  console.log(path.join(__dirname, "/static/upload", route));
  res.sendFile(path.join(__dirname, "/static/upload", route));
});
app.listen(PORT, function () {
  console.log("start serwera na porcie " + PORT);
});
users = [
  {
    login: "wow",
    pass: "wow",
  },
];
//registering
app.get("/register", function (req, res) {
  res.render("register.hbs",{cookie:req.cookies.login});
});
// app.post("/getUserInfo", function (req, res) {
//   const data = req.body
//   console.log(users.findIndex(el => el.login == data.login) !== -1);
//   if (users.findIndex(el => el.login == data.login) !== -1) {
//     res.redirect('/error?value=Taki_uzytkownik_istnieje')
//   } else {
//     users.push(data)
//     res.redirect('/login')
//   }
//   console.log(users);
//   // res.render('error.hbs')
// });
// app.get('/error', function (req, res) {
//   const data = req.query.value
//   console.log(data);
//   res.render('error.hbs', { message: data })
// })
app.get("/handleRegister", function (req, res) {
  const data = req.query;
  if (users.findIndex((el) => el.login == data.login) !== -1) {
    res.render("error.hbs", { message: "Takie uzytkownik już istnieje" });
  } else {
    users.push(data);
    res.redirect("/login");
  }
});

app.get("/login", function (req, res) {

  res.render("login.hbs",{cookie:req.cookies.login});
});
let timer=30
let interval
app.get("/handleLogin", function (req, res) {
  const data = req.query;
  const index=users.findIndex((el) => el.login == data.login)
  if ( index== -1) {
    res.render("error.hbs", { message: "Taki uzytkownik nie istnieje" });
  } else if(users[index].pass==data.pass) {
    res.cookie("login", data.login, { httpOnly: true, maxAge: 30 * 1000 }); // testowe 30 sekund
interval=setInterval(()=>{timer--;
if(timer==0) clearInterval(interval)},1000)
    res.redirect(`/home`)

  }
});
app.get('/home',function(req,res){
  const login=req.cookies.login
  console.log(req.cookies);
  if(login==undefined) {res.redirect('/login');return;}
    // const data=req.query.name
    console.log(timer);
  res.render('home.hbs',{name:login,age:timer});
})

app.get("/logout", function (req, res) {
  res.render("logout.hbs",{cookie:req.cookies.login});
});

app.get("/handleLogOut", function (req, res) {
  res.clearCookie('login')
  res.redirect('/login')
});