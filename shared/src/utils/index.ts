import { app, BrowserWindow, screen } from "electron";
import * as path from "path";

/**
 * Utility function to create a browser window with standard configuration
 */
export function createStandardWindow(windowName: string, options: Electron.BrowserWindowConstructorOptions = {}): BrowserWindow {
  const { width = 1200, height = 800 } = options;

  // Get the primary display
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workArea;

  // Calculate centered position
  const x = Math.floor((screenWidth - width) / 2);
  const y = Math.floor((screenHeight - height) / 2);

  const windowOptions: Electron.BrowserWindowConstructorOptions = {
    width,
    height,
    x,
    y,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, "preload.js"),
      ...options.webPreferences,
    },
    icon: path.join(__dirname, "../assets/icon.png"), // We'll add this later
    show: false,
    resizable: true,
    ...options,
  };

  const window = new BrowserWindow(windowOptions);
  window.setBackgroundColor("#f0f0f0"); // Set a default background color

  return window;
}

/**
 * Utility function to get user data path for a specific app
 */
export function getAppDataPath(appName: string): string {
  return path.join(app.getPath("userData"), appName);
}

/**
 * Utility function to validate URL
 */
export function isValidUrl(input: string): boolean {
  try {
    new URL(input);
    return true;
  } catch {
    return false;
  }
}

/**
 * Utility function to normalize URL
 */
export function normalizeUrl(input: string): string {
  if (!input.startsWith("http://") && !input.startsWith("https://")) {
    return `https://${input}`;
  }
  return input;
}
