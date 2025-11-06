import { app, BrowserWindow, ipcMain, Menu, dialog, nativeImage } from 'electron';
import * as path from 'path';
import { SecureStorageService, createStandardWindow, isValidUrl, normalizeUrl } from '@electron-dsm-client/shared';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const DSM_URL = 'https://www.synology.com/dsm';

let mainWindow: BrowserWindow | null = null;
let credentials: { serverUrl: string; username: string; password: string } | null = null;

const secureStorage = SecureStorageService.getInstance();

const createWindow = (): void => {
  // Create the browser window
  mainWindow = createStandardWindow('dsm', {
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icon.png')
  });

  // Load the index.html of the app
  mainWindow.loadFile(path.join(__dirname, '../src/index.html'));

  // Open the DevTools in development mode
  if (process.argv.includes('--dev') || process.env.NODE_ENV === 'development') {
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
        password: storedCredentials.password
      };
    }
  } catch (error) {
    console.error('Failed to retrieve stored credentials:', error);
    dialog.showErrorBox('Error', 'Failed to retrieve stored credentials');
  }

  // Create the main window
  createWindow();

  // Set up application menu
  const menu = Menu.buildFromTemplate([
    {
      label: 'DSM',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(process.platform === 'darwin' ? [
          { type: 'separator' },
          { role: 'front' }
        ] : []),
        { type: 'separator' },
        { role: 'close' }
      ]
    }
  ]);
  Menu.setApplicationMenu(menu);

  // Handle IPC events from renderer
  ipcMain.handle('get-credentials', async () => {
    return credentials;
  });

  ipcMain.handle('save-credentials', async (event, newCredentials) => {
    try {
      await secureStorage.storeCredentials({
        serverUrl: newCredentials.serverUrl,
        username: newCredentials.username,
        password: newCredentials.password
      });
      credentials = newCredentials;
      return { success: true };
    } catch (error) {
      console.error('Failed to save credentials:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('load-dsm-url', async (event, url) => {
    if (mainWindow && url) {
      try {
        const normalizedUrl = normalizeUrl(url);
        if (isValidUrl(normalizedUrl)) {
          mainWindow.loadURL(normalizedUrl);
          return { success: true };
        } else {
          return { success: false, error: 'Invalid URL' };
        }
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
    return { success: false, error: 'Main window not available or URL not provided' };
  });

  // On macOS, re-create a window when the dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Cleanup when app quits
app.on('quit', () => {
  mainWindow = null;
});