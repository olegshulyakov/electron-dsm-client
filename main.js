// Modules to control application life and create native browser window
const { app, BrowserWindow, globalShortcut } = require("electron");
const path = require("path");
const Store = require("electron-store");
const prompt = require("electron-prompt");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
const promtTemplate = {
    label: "Please enter your Disk Station Manager URL, for example: https://<your-nas-ip>:<your-nas-port>/",
    inputAttrs: {
        type: "url",
    },
    type: "input",
    width: 800,
    height: 180,
};
let mainWindow;
let storeInstance = new Store();

function checkConfig() {
    const url = storeInstance.get("url");

    if (!url) {
        initConfig();
    } else {
        createWindow(url);
    }
}

function initConfig() {
    prompt({
        ...promtTemplate,
        title: "Initialize",
        value: "https://<your-nas-ip>:<your-nas-port>/",
    })
        .then((result) => {
            if (result === null) {
                app.exit();
            } else {
                storeInstance.set("url", result);
                createWindow(storeInstance.get("url"));
            }
        })
        .catch(console.error);
}

function editConfig() {
    prompt({
        ...promtTemplate,
        title: "Edit Configuration",
        value: storeInstance.get("url") || "",
    })
        .then((result) => {
            if (result !== null) {
                storeInstance.set("url", result);
                mainWindow.loadURL(result);
            }
        })
        .catch(console.error);
}

function registerShortcut() {
    // const SynologyAudioStationControlScript = {
    //     play: 'SYNO.SDS.AudioStation.Window.getPanelScope("SYNO.SDS.AudioStation.Main").audioPlayer.doPlay()',
    //     stop: 'SYNO.SDS.AudioStation.Window.getPanelScope("SYNO.SDS.AudioStation.Main").audioPlayer.doStop()',
    //     previous: 'SYNO.SDS.AudioStation.Window.getPanelScope("SYNO.SDS.AudioStation.Main").audioPlayer.doPrevious()',
    //     next: 'SYNO.SDS.AudioStation.Window.getPanelScope("SYNO.SDS.AudioStation.Main").audioPlayer.doNext()',
    // }

    // globalShortcut.register("MediaPlayPause", () => {
    //     mainWindow.webContents.executeJavaScript(SynologyAudioStationControlScript.play);
    // });

    // globalShortcut.register('MediaPreviousTrack', () => {
    //     mainWindow.webContents.executeJavaScript(SynologyAudioStationControlScript.previous);
    // });

    // globalShortcut.register("MediaNextTrack", () => {
    //     mainWindow.webContents.executeJavaScript(SynologyAudioStationControlScript.next);
    // });

    // globalShortcut.register("MediaStop", () => {
    //     mainWindow.webContents.executeJavaScript(SynologyAudioStationControlScript.stop);
    // });

    globalShortcut.register("CommandOrControl+E", () => {
        editConfig();
    });
}

function createWindow(url) {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
        title: "Electron Disk Station Manager",
    });

    mainWindow.loadURL(url); // you Disk Station Managers location
    // and load the index.html of the app.

    registerShortcut();
    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on("closed", function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", checkConfig);

// SSL/TSL: this is the self signed certificate support
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    // On certificate error we disable default behaviour (stop loading the page)
    // and we then say "it is all fine - true" to the callback
    event.preventDefault();
    callback(true);
});

// Quit when all windows are closed.
// app.on('window-all-closed', function () {
//   // On macOS it is common for applications and their menu bar
//   // to stay active until the user quits explicitly with Cmd + Q
//   app.quit()
// })

app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) createWindow();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
