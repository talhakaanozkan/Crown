const { app, BrowserWindow } = require('electron')
const { connect, authenticate, LeagueClient } = require("league-connect");
const path = require('path')

const RequestManager = require("./request-manager");

async function init(credentials, mainWindow) {
  mainWindow.send("credentials", credentials);

  RequestManager.init(credentials);
  //SaveManager.init(await loadSummoner(mainWindow), (updatedPages) => mainWindow.send("saved-pages-update", updatedPages));

  connect(credentials).then(webSocket => {
    webSocket.subscribe("/lol-lobby-team-builder/v1/matchmaking", (data, event) => {
      //console.log("data", data);
      //console.log("event", event);

      if (data != null) {
        if (data.searchState == "Found") {
          RequestManager.tryRequest("POST", "/lol-matchmaking/v1/ready-check/accept").then((result) => console.log("result", result));
        }
      }

      //if (event.eventType == "Create") SessionManager.loadSession(session);
      //else if (event.eventType == "Delete") SessionManager.unloadSession();
    });

    //webSocket.subscribe("/lol-summoner/v1/current-summoner", (summoner, event) => loadSummoner(renderer, summoner));
    /*SessionManager.init(mainWindow, webSocket, RequestManager);
    RequestManager.tryRequest("GET", "/lol-champ-select/v1/session").then((session) => SessionManager.loadSession(session));

    webSocket.subscribe("/lol-summoner/v1/current-summoner", (summoner, event) => loadSummoner(renderer, summoner));
    webSocket.subscribe("/lol-champ-select/v1/session", (session, event) => {
      if (event.eventType == "Create") SessionManager.loadSession(session);
      else if (event.eventType == "Delete") SessionManager.unloadSession();
    });*/
  });
}

app.on('ready', () => {

  let win = new BrowserWindow({
    width: 550,
    height: 300,
    frame: false,
    //transparent: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true
    },
    icon: path.join(__dirname, 'assets/icon/favicon.ico')
  })

  //mainWindow.webContents.openDevTools();
  win.loadFile("index.html", () => {
    setTimeout(() => win.show(), 1000);
    authenticate({ awaitConnection: true, pollInterval: 5000 }).then(credentials => {
      init(credentials, win);

      let client = new LeagueClient(credentials);
      client.on("connect", newCredentials => init(newCredentials, win));
      client.on("disconnect", () => reset(win));
      client.start();
    });
  })

});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })