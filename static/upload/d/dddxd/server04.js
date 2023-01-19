const express = require("express")
const app = express()
const PORT = 3000;
app.use(express.static('static'))
app.use(express.json());

const path = require("path")

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname + "/static/index.html"))
})

app.post("/post", function (req, res) {
    const data = req.body;
    const exitData = {
        range: data.range
    }
    console.log(exitData);
    res.send(JSON.stringify(exitData, null, 5));
})

app.listen(PORT, function () {
    console.log("start serwera na porcie " + PORT)
})