import { createStandardWindow, isValidUrl, normalizeUrl, SecureStorageService } from "@electron-dsm-client/shared";
import { app, BrowserWindow, dialog, ipcMain, Menu } from "electron";
import * as path from "path";

const AUDIO_URL = "https://www.synology.com/audio";

let mainWindow: BrowserWindow | null = null;
let credentials: { serverUrl: string; username: string; password: string } | null = null;

const secureStorage = SecureStorageService.getInstance();

const createWindow = (): void => {
  // Create the browser window
  mainWindow = createStandardWindow("audio", {
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "../assets/icon.png"),
  });

  // Load the index.html of the app
  mainWindow.loadFile(path.join(__dirname, "../src/index.html"));

  // Open the DevTools in development mode
  if (process.argv.includes("--dev") || process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools();
  }
};

// This method will be called when Electron has finished initialization
app.whenReady().then(async () => {
  // Retrieve stored credentials
  try {
    const storedCredentials = await secureStorage.retrieveCredentials();
    if (storedCredentials) {
      credentials = {
        serverUrl: storedCredentials.serverUrl,
        username: storedCredentials.username,
        password: storedCredentials.password,
      };
    }
  } catch (error: unknown) {
    console.error("Failed to retrieve stored credentials:", error);
    let errorMessage = "Failed to retrieve stored credentials";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    dialog.showErrorBox("Error", errorMessage);
  }

  // Create the main window
  createWindow();

  // Set up application menu
  const menu = Menu.buildFromTemplate([
    {
      label: "Audio",
      submenu: [
        { role: "about" as const },
        { type: "separator" as const },
        { role: "services" as const },
        { type: "separator" as const },
        { role: "hide" as const },
        { role: "hideOthers" as const },
        { role: "unhide" as const },
        { type: "separator" as const },
        { role: "quit" as const },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" as const },
        { role: "redo" as const },
        { type: "separator" as const },
        { role: "cut" as const },
        { role: "copy" as const },
        { role: "paste" as const },
        { role: "selectAll" as const },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" as const },
        { role: "forceReload" as const },
        { role: "toggleDevTools" as const },
        { type: "separator" as const },
        { role: "resetZoom" as const },
        { role: "zoomIn" as const },
        { role: "zoomOut" as const },
        { type: "separator" as const },
        { role: "togglefullscreen" as const },
      ],
    },
    {
      label: "Window",
      submenu: [
        { role: "minimize" as const },
        { role: "zoom" as const },
        ...(process.platform === "darwin" ? [{ type: "separator" as const }, { role: "front" as const }] : []),
        { type: "separator" as const },
        { role: "close" as const },
      ],
    },
  ]);
  Menu.setApplicationMenu(menu);

  // Handle IPC events from renderer
  ipcMain.handle("get-credentials", async () => {
    return credentials;
  });

  ipcMain.handle("save-credentials", async (event, newCredentials) => {
    try {
      await secureStorage.storeCredentials({
        serverUrl: newCredentials.serverUrl,
        username: newCredentials.username,
        password: newCredentials.password,
      });
      credentials = newCredentials;
      return { success: true };
    } catch (error: unknown) {
      console.error("Failed to save credentials:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  });

  ipcMain.handle("load-audio-url", async (event, url) => {
    if (mainWindow && url) {
      try {
        const normalizedUrl = normalizeUrl(url);
        if (isValidUrl(normalizedUrl)) {
          mainWindow.loadURL(normalizedUrl);
          return { success: true };
        } else {
          return { success: false, error: "Invalid URL" };
        }
      } catch (error: unknown) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error occurred",
        };
      }
    }
    return { success: false, error: "Main window not available or URL not provided" };
  });

  // On macOS, re-create a window when the dock icon is clicked
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Cleanup when app quits
app.on("quit", () => {
  mainWindow = null;
});
