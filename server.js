const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require("fs");
const { marked } = import('marked'); 

const app = express();
const port = 3000;
const hostname = '127.0.0.1';


app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'main.html'));
});

app.use(express.json());
app.use(bodyParser.json());

app.get("/get-islocalhost", (req, res) => {
    res.send("islocalhost");
});

app.get("/get-full-screen", (req, res) => {
    res.send("full-screen");
});

app.listen(port, () => {
    console.log(`伺服器運行在 http://${hostname}:${port}`);
});