// app module controls app's event lifecycle
// BrowserWindow module creates and manages app windows
const { app, BrowserWindow } = require("electron");

const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const url = require("node:url");

const hostname = "127.0.0.1";
const port = 3000;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  console.log(url);
  if (url.pathname == "/field") {
    if (url.searchParams.get("save")) {
      return res.end(`
        <html>
        <div id='${url.searchParams.get("id")}'>
          <b>${url.searchParams.get("value")}</b>
          <a href="/field?id=${url.searchParams.get("id")}&value=${url.searchParams.get("value")}#${url.searchParams.get("id")}">
            edit
          </a>
        </div>
        </html>
      `);
    } else {
      return res.end(`
          <html>
          <form id="${url.searchParams.get("id")}" action="/field#${url.searchParams.get("id")}">
            <input hidden name="id" value="${url.searchParams.get("id")}">
            <input name="value" value="${url.searchParams.get("value")}">
            <button name="save" value="save">save</button>
          </form>
          </html>
      `);
    }
  } else {
    fs.readFile("index.html", (err, data) => {
      res.writeHead(200, {"Content-Type": "text/html"});
      res.write(data);
      return res.end();
    })
  }
}).listen(port);

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  win.loadURL("http://localhost:3000");
}

app.whenReady().then(() => {
  createWindow();

  // for macOS
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  })
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});